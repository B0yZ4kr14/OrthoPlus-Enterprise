import { Request, Response } from "express"
import Database from "better-sqlite3"
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

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db"
const db = new Database(dbPath)

const metrics = getMetricsCollector(prometheusMetrics.getRegistry())

const embedder = new OllamaEmbeddingClient()
const embeddings = new EmbeddingRepository(db)
const documents = new DocumentRepository(db)
const searchService = new SearchService(embedder, embeddings)
const contextBriefService = new ContextBriefService(searchService, documents)
const indexingService = new IndexingService(db)

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

      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query is required" })
      }

      const result = await searchService.search(
        query,
        filters || {},
        Number(limit),
        Number(offset),
      )

      const duration = (Date.now() - startTime) / 1000
      metrics.memoryHub.searchDuration.observe({ category: "memory_hub" }, duration)

      return res.json({
        ...result,
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

      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ error: "Topic is required" })
      }

      const brief = await contextBriefService.generateBrief(
        topic,
        Number(max_tokens),
        Boolean(include_related),
      )

      const duration = (Date.now() - startTime) / 1000
      metrics.memoryHub.briefGenerationDuration.observe({ category: "memory_hub" }, duration)

      return res.json(brief)
    } catch (error) {
      logger.error("[MemoryHub] Context brief error", { error, topic: req.body.topic })
      return res.status(500).json({ error: "Context brief generation failed" })
    }
  }

  async health(_req: Request, res: Response) {
    try {
      const totalDocs = documents.count()
      const allDocs = documents.listAll()
      const driftCount = db.prepare(
        "SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL",
      ).get() as { c: number }

      // Coverage: docs indexed in last 7 days vs total markdown files
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const recentlyIndexed = allDocs.filter((d) => d.lastIndexed > oneWeekAgo).length
      const coveragePercent = totalDocs > 0 ? Math.round((recentlyIndexed / totalDocs) * 100) : 0

      metrics.memoryHub.coveragePercent.set({ category: "memory_hub" }, coveragePercent)

      return res.json({
        index_status: totalDocs > 0 ? "healthy" : "empty",
        documents_indexed: totalDocs,
        last_scan_at: allDocs[0]?.lastIndexed
          ? new Date(allDocs[0].lastIndexed).toISOString()
          : null,
        drift_count: driftCount.c,
        coverage_percent: coveragePercent,
      })
    } catch (error) {
      logger.error("[MemoryHub] Health error", { error })
      return res.status(500).json({ error: "Health check failed" })
    }
  }
}
