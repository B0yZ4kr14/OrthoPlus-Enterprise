import { Request, Response } from "express"
import Database from "better-sqlite3"
import crypto from "crypto"
import { logger } from "@/infrastructure/logger"
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector"
import { prometheusMetrics } from "@/infrastructure/metrics/PrometheusMetrics"
import { SearchService } from "../domain/services/SearchService"
import { ContextBriefService } from "../domain/services/ContextBriefService"
import { IndexingService } from "../domain/services/IndexingService"
import { OllamaEmbeddingClient } from "../infrastructure/OllamaEmbeddingClient"
import { EmbeddingRepository } from "../infrastructure/EmbeddingRepository"
import { DocumentRepository } from "../infrastructure/DocumentRepository"
import { FileWatcher } from "../infrastructure/FileWatcher"
import { GraphService } from "../domain/services/GraphService"

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db"

// Ensure parent directory exists with restricted permissions (F-RT-020-016)
import fs from "fs"
import path from "path"
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true, mode: 0o700 })
}

const db = new Database(dbPath)

// Restrict SQLite file permissions to owner only (F-RT-020-016)
try {
  fs.chmodSync(dbPath, 0o600)
} catch {
  logger.warn("[MemoryHub] Could not set SQLite file permissions")
}

// Backup index mechanism: copy DB to .backup on startup (F-RT-020-016)
const backupPath = dbPath + ".backup"
try {
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath)
    fs.chmodSync(backupPath, 0o600)
  }
} catch {
  logger.warn("[MemoryHub] Could not create backup index")
}

const metrics = getMetricsCollector(prometheusMetrics.getRegistry())

const embedder = new OllamaEmbeddingClient()
const embeddings = new EmbeddingRepository(db)
const documents = new DocumentRepository(db)
const searchService = new SearchService(embedder, embeddings)
const contextBriefService = new ContextBriefService(searchService, documents)
const indexingService = new IndexingService(db)
const graphService = new GraphService(documents)

// Auto-start file watcher if enabled
if (process.env.MEMORY_HUB_ENABLED === "true") {
  const watcher = new FileWatcher(async (events) => {
    for (const evt of events) {
      if (evt.type === "unlink") {
        indexingService.archiveFile(evt.filePath)
      } else {
        try {
          await indexingService.indexFile(evt.filePath)
        } catch (err) {
          logger.error(`[MemoryHub] Auto-index failed for ${evt.filePath}`, { error: err })
        }
      }
    }
  })

  const watchDirs = (process.env.MEMORY_HUB_WATCH_DIRS || "specs/,docs/,categories/")
    .split(",")
    .map((d) => d.trim())
  const pollingInterval = parseInt(process.env.MEMORY_HUB_POLLING_INTERVAL_MS || "30000", 10)

  watcher.start(watchDirs, pollingInterval)
}

export class MemoryHubController {
  async search(req: Request, res: Response) {
    const startTime = Date.now()
    try {
      const { query, filters, limit = 10, offset = 0 } = req.body
      const clinicId = (req as any).user?.clinicId || "default"

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" })
      }

      // Validate limit and offset bounds (F-RT-020-014)
      const numLimit = Math.min(Math.max(Number(limit) || 10, 1), 100)
      const numOffset = Math.max(Number(offset) || 0, 0)

      // Build advanced filters (T053)
      const searchFilters: any = filters || {}
      if (filters?.author && typeof filters.author === "string") {
        searchFilters.author = filters.author
      }
      if (filters?.featureNumber && typeof filters.featureNumber === "string") {
        searchFilters.featureNumber = filters.featureNumber
      }
      if (filters?.dateFrom) {
        const d = Number(filters.dateFrom)
        if (!isNaN(d)) searchFilters.dateFrom = d
      }
      if (filters?.dateTo) {
        const d = Number(filters.dateTo)
        if (!isNaN(d)) searchFilters.dateTo = d
      }

      let result = await searchService.search(
        query,
        searchFilters,
        numLimit,
        numOffset,
        clinicId,
      )

      // Filter out confidential documents from search results (F-RT-020-008)
      let confidentialExcluded = 0
      const filteredResults = result.results.filter((r) => {
        const doc = documents.findByPath(r.sourcePath, clinicId)
        if (!doc) return false
        if (documents.isConfidential(doc)) {
          confidentialExcluded++
          return false
        }
        return true
      })
      result = { ...result, results: filteredResults }

      const duration = (Date.now() - startTime) / 1000
      metrics.memoryHub.searchDuration.observe({ category: "memory_hub" }, duration)

      // Log search query with clinic and user attribution (F-RT-020-010)
      db.prepare(
        `INSERT INTO search_queries (id, clinic_id, user_id, query_text, results_count, duration_ms, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        crypto.randomUUID(),
        clinicId,
        (req as any).user?.id || null,
        query,
        result.results.length,
        Math.round(duration * 1000),
        Date.now(),
      )

      return res.json({
        ...result,
        confidential_excluded: confidentialExcluded,
        query_time_ms: Date.now(),
      })
    } catch (error) {
      logger.error("[MemoryHub] Search error", { error, query: req.body.query })
      return res.status(500).json({ error: "Search failed" })
    }
  }

  async reindex(_req: Request, res: Response) {
    const startTime = Date.now()
    try {
      const watchDirs = (process.env.MEMORY_HUB_WATCH_DIRS || "specs/,docs/,categories/")
        .split(",")
        .map((d) => d.trim())

      await indexingService.reindexAll(watchDirs)

      const duration = (Date.now() - startTime) / 1000
      metrics.memoryHub.indexDuration.observe({ category: "memory_hub" }, duration)
      metrics.memoryHub.documentsIndexed.inc({ category: "memory_hub" })

      return res.json({ message: "Reindex complete" })
    } catch (error) {
      logger.error("[MemoryHub] Reindex error", { error })
      return res.status(500).json({ error: "Reindex failed" })
    }
  }

  async contextBrief(req: Request, res: Response) {
    const startTime = Date.now()
    try {
      const { topic, max_tokens = 80000, include_related = true } = req.body
      const clinicId = (req as any).user?.clinicId || "default"

      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required" })
      }

      // Validate max_tokens is a positive finite integer (F-RT-020-012)
      const numMaxTokens = Number(max_tokens)
      const safeMaxTokens = Number.isFinite(numMaxTokens) && numMaxTokens > 0
        ? Math.min(numMaxTokens, 128000)
        : 80000

      const brief = await contextBriefService.generateBrief(
        topic,
        safeMaxTokens,
        Boolean(include_related),
        clinicId,
      )

      const duration = (Date.now() - startTime) / 1000
      metrics.memoryHub.briefGenerationDuration.observe({ category: "memory_hub" }, duration)

      return res.json(brief)
    } catch (error) {
      logger.error("[MemoryHub] Context brief error", { error, topic: req.body.topic })
      return res.status(500).json({ error: "Context brief generation failed" })
    }
  }

  async versions(req: Request, res: Response) {
    try {
      const { sourcePath } = req.query
      if (!sourcePath || typeof sourcePath !== "string") {
        return res.status(400).json({ error: "sourcePath query parameter is required" })
      }

      // Validate sourcePath against allowlist (F-RT-020-015)
      const allowedPrefixes = ["specs/", "docs/", ".specify/memory/", ".omk/memory/", "categories/"]
      const isAllowed = allowedPrefixes.some((prefix) => sourcePath.startsWith(prefix))
      if (!isAllowed) {
        return res.status(400).json({ error: "Invalid sourcePath" })
      }

      const clinicId = (req as any).user?.clinicId || "default"
      const versions = documents.findVersions(sourcePath, clinicId)
      return res.json({ sourcePath, versions, count: versions.length })
    } catch (error) {
      logger.error("[MemoryHub] Versions error", { error, sourcePath: req.query.sourcePath })
      return res.status(500).json({ error: "Version retrieval failed" })
    }
  }

  async health(req: Request, res: Response) {
    try {
      const clinicId = (req as any).user?.clinicId || "default"
      const totalDocs = documents.count(clinicId)
      const allDocs = documents.listAll(clinicId)
      const driftCount = db.prepare(
        "SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL",
      ).get() as { c: number }

      // Coverage: docs indexed in last 7 days vs total markdown files
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const recentlyIndexed = allDocs.filter((d) => d.lastIndexed > oneWeekAgo).length
      const coveragePercent = totalDocs > 0 ? Math.round((recentlyIndexed / totalDocs) * 100) : 0

      metrics.memoryHub.coveragePercent.set({ category: "memory_hub" }, coveragePercent)

      // T054: Compression stats
      const compressionStats = embeddings.getCompressionStats()

      return res.json({
        indexStatus: totalDocs > 0 ? "healthy" : "empty",
        totalDocuments: totalDocs,
        compressionRatio: Math.round(compressionStats.compressionRatio * 100) / 100,
        compressedEmbeddings: compressionStats.compressedEmbeddings,
        spaceSavedBytes: compressionStats.spaceSavedBytes,
        lastScan: allDocs[0]?.lastIndexed
          ? new Date(allDocs[0].lastIndexed).toISOString()
          : null,
        driftCount: driftCount.c,
        coveragePercent: coveragePercent,
      })
    } catch (error) {
      logger.error("[MemoryHub] Health error", { error })
      return res.status(500).json({ error: "Health check failed" })
    }
  }

  async graph(req: Request, res: Response) {
    try {
      const clinicId = (req as any).user?.clinicId || "default"
      const graphData = graphService.buildGraph(clinicId)
      return res.json(graphData)
    } catch (error) {
      logger.error("[MemoryHub] Graph error", { error })
      return res.status(500).json({ error: "Graph generation failed" })
    }
  }
}
