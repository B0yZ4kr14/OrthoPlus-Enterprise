import { Request, Response } from "express"

import { logger } from "@/infrastructure/logger"
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector"
type MetricsCollector = ReturnType<typeof getMetricsCollector>
import { SearchService } from "../domain/services/SearchService"
import { ContextBriefService } from "../domain/services/ContextBriefService"
import { IndexingService } from "../domain/services/IndexingService"
import { GraphService } from "../domain/services/GraphService"
import { HealthService } from "../domain/services/HealthService"
import { DocumentRepository } from "../infrastructure/DocumentRepository"

import { SearchAuditRepository } from "../infrastructure/SearchAuditRepository"

export interface MemoryHubControllerDeps {
  searchService: SearchService
  contextBriefService: ContextBriefService
  indexingService: IndexingService
  graphService: GraphService
  documents: DocumentRepository
  auditRepository: SearchAuditRepository
  healthService: HealthService
  metrics: MetricsCollector
}

export class MemoryHubController {
  private searchService: SearchService
  private contextBriefService: ContextBriefService
  private indexingService: IndexingService
  private graphService: GraphService
  private documents: DocumentRepository
  private auditRepository: SearchAuditRepository
  private healthService: HealthService
  private metrics: MetricsCollector

  constructor(deps: MemoryHubControllerDeps) {
    this.searchService = deps.searchService
    this.contextBriefService = deps.contextBriefService
    this.indexingService = deps.indexingService
    this.graphService = deps.graphService
    this.documents = deps.documents
    this.auditRepository = deps.auditRepository
    this.healthService = deps.healthService
    this.metrics = deps.metrics
  }

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

      const { results: filteredResults, total, confidentialExcluded } =
        await this.searchService.searchWithConfidentialityFilter(
          query,
          searchFilters,
          numLimit,
          numOffset,
          clinicId,
        )

      const duration = (Date.now() - startTime) / 1000
      this.metrics.memoryHub.searchDuration.observe({ category: "memory_hub" }, duration)

      // Log search query with clinic and user attribution (F-RT-020-010)
      this.auditRepository.logQuery(
        clinicId,
        (req as any).user?.id || null,
        query,
        filteredResults.length,
        Math.round(duration * 1000),
      )

      return res.json({
        results: filteredResults,
        total,
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

      await this.indexingService.reindexAll(watchDirs)

      const duration = (Date.now() - startTime) / 1000
      this.metrics.memoryHub.indexDuration.observe({ category: "memory_hub" }, duration)
      this.metrics.memoryHub.documentsIndexed.inc({ category: "memory_hub" })

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

      const brief = await this.contextBriefService.generateBrief(
        topic,
        safeMaxTokens,
        Boolean(include_related),
        clinicId,
      )

      const duration = (Date.now() - startTime) / 1000
      this.metrics.memoryHub.briefGenerationDuration.observe({ category: "memory_hub" }, duration)

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
      const versions = this.documents.findVersions(sourcePath, clinicId)
      return res.json({ sourcePath, versions, count: versions.length })
    } catch (error) {
      logger.error("[MemoryHub] Versions error", { error, sourcePath: req.query.sourcePath })
      return res.status(500).json({ error: "Version retrieval failed" })
    }
  }

  async health(req: Request, res: Response) {
    try {
      const clinicId = (req as any).user?.clinicId || "default"
      const metrics = this.healthService.getMetrics(clinicId)

      this.metrics.memoryHub.coveragePercent.set({ category: "memory_hub" }, metrics.coveragePercent)

      return res.json(metrics)
    } catch (error) {
      logger.error("[MemoryHub] Health error", { error })
      return res.status(500).json({ error: "Health check failed" })
    }
  }

  async graph(req: Request, res: Response) {
    try {
      const clinicId = (req as any).user?.clinicId || "default"
      const graphData = this.graphService.buildGraph(clinicId)
      return res.json(graphData)
    } catch (error) {
      logger.error("[MemoryHub] Graph error", { error })
      return res.status(500).json({ error: "Graph generation failed" })
    }
  }
}
