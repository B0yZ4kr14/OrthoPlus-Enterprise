import Database from "better-sqlite3"
import { Request, Response } from "express"
import { asyncHandler, Errors } from "@/middleware/errorHandler"
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
import { CostTrackingService } from "../domain/services/CostTrackingService"

export interface MemoryHubControllerDeps {
  searchService: SearchService
  contextBriefService: ContextBriefService
  indexingService: IndexingService
  graphService: GraphService
  documents: DocumentRepository
  auditRepository: SearchAuditRepository
  healthService: HealthService
  costTrackingService?: CostTrackingService
  metrics: MetricsCollector
  db: Database.Database
}

export class MemoryHubController {
  private searchService: SearchService
  private contextBriefService: ContextBriefService
  private indexingService: IndexingService
  private graphService: GraphService
  private documents: DocumentRepository
  private auditRepository: SearchAuditRepository
  private healthService: HealthService
  private costTrackingService?: CostTrackingService
  private metrics: MetricsCollector
  private db: Database.Database

  constructor(deps: MemoryHubControllerDeps) {
    this.searchService = deps.searchService
    this.contextBriefService = deps.contextBriefService
    this.indexingService = deps.indexingService
    this.graphService = deps.graphService
    this.documents = deps.documents
    this.auditRepository = deps.auditRepository
    this.healthService = deps.healthService
    this.costTrackingService = deps.costTrackingService
    this.metrics = deps.metrics
    this.db = deps.db
  }

  search = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now()
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { query, filters, limit = 10, offset = 0 } = req.body
    if (!query || typeof query !== "string") {
      throw Errors.validation("Query is required", [
        { field: "query", message: "Query must be a non-empty string", code: "required" },
      ])
    }

    const numLimit = Math.min(Math.max(Number(limit) || 10, 1), 100)
    const numOffset = Math.max(Number(offset) || 0, 0)

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

    this.auditRepository.logQuery(
      clinicId,
      req.user?.id || null,
      query,
      filteredResults.length,
      Math.round(duration * 1000),
    )

    // NFR-008: Cost tracking per clinic
    if (this.costTrackingService) {
      const provider = process.env.MEMORY_HUB_EMBEDDING_PROVIDER || "ollama"
      const model = process.env.MEMORY_HUB_EMBEDDING_MODEL || (provider === "ollama" ? "nomic-embed-text" : "text-embedding-3-small")
      const cost = this.costTrackingService.logCost(clinicId, query, provider, model)
      if (cost.costUsd > 0) {
        logger.info("[MemoryHubController] Search cost tracked", { clinicId, costUsd: cost.costUsd, tokens: cost.tokens })
      }
    }

    res.json({
      results: filteredResults,
      total,
      confidential_excluded: confidentialExcluded,
      query_time_ms: Date.now(),
    })
  })

  reindex = asyncHandler(async (_req: Request, res: Response) => {
    const startTime = Date.now()
    const watchDirs = (process.env.MEMORY_HUB_WATCH_DIRS || "specs/,docs/,categories/")
      .split(",")
      .map((d) => d.trim())

    await this.indexingService.reindexAll(watchDirs)

    const duration = (Date.now() - startTime) / 1000
    this.metrics.memoryHub.indexDuration.observe({ category: "memory_hub" }, duration)
    this.metrics.memoryHub.documentsIndexed.inc({ category: "memory_hub" })

    res.json({ message: "Reindex complete" })
  })

  contextBrief = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now()
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { topic, max_tokens = 80000, include_related = true } = req.body
    if (!topic || typeof topic !== "string") {
      throw Errors.validation("Topic is required", [
        { field: "topic", message: "Topic must be a non-empty string", code: "required" },
      ])
    }

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

    res.json(brief)
  })

  versions = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { sourcePath } = req.query
    if (!sourcePath || typeof sourcePath !== "string") {
      throw Errors.validation("sourcePath is required", [
        { field: "sourcePath", message: "sourcePath query parameter is required", code: "required" },
      ])
    }

    const allowedPrefixes = ["specs/", "docs/", ".specify/memory/", ".omk/memory/", "categories/"]
    const isAllowed = allowedPrefixes.some((prefix) => sourcePath.startsWith(prefix))
    if (!isAllowed) {
      throw Errors.validation("Invalid sourcePath", [
        { field: "sourcePath", message: "Path must start with an allowed prefix", code: "invalid" },
      ])
    }

    const versions = this.documents.findVersions(sourcePath, clinicId)
    res.json({ sourcePath, versions, count: versions.length })
  })

  health = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const metrics = this.healthService.getMetrics(clinicId)
    this.metrics.memoryHub.coveragePercent.set({ category: "memory_hub" }, metrics.coveragePercent)

    res.json(metrics)
  })

  graph = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const graphData = this.graphService.buildGraph(clinicId)
    res.json(graphData)
  })

  rotateKey = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { provider, apiKey, model, baseUrl } = req.body
    const updates: Record<string, string> = {}
    if (provider !== undefined) updates.provider = provider
    if (apiKey !== undefined) updates.apiKey = apiKey
    if (model !== undefined) updates.model = model
    if (baseUrl !== undefined) updates.baseUrl = baseUrl

    const { EmbeddingClientFactory } = await import("../infrastructure/EmbeddingClientFactory")
    const config = EmbeddingClientFactory.updateConfig(updates)

    res.json({
      message: "Embedding configuration updated",
      provider: config.provider,
      model: config.model || "default",
    })
  })

  costs = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    if (!this.costTrackingService) {
      res.status(503).json({ error: "Cost tracking not enabled" })
      return
    }

    const { month } = req.query
    const summary = this.costTrackingService.getMonthlySummary(
      clinicId,
      typeof month === "string" ? month : undefined,
    )

    res.json(summary)
  })

  drift = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { severity, limit = 50, offset = 0 } = req.query
    const numLimit = Math.min(Math.max(Number(limit) || 50, 1), 200)
    const numOffset = Math.max(Number(offset) || 0, 0)

    const sql = severity && typeof severity === "string"
      ? `SELECT * FROM drift_reports WHERE resolved_at IS NULL AND severity = ? ORDER BY detected_at DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM drift_reports WHERE resolved_at IS NULL ORDER BY detected_at DESC LIMIT ? OFFSET ?`

    const stmt = this.db.prepare(sql)
    const rows = severity
      ? stmt.all(severity, numLimit, numOffset)
      : stmt.all(numLimit, numOffset)

    const totalStmt = severity
      ? this.db.prepare("SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL AND severity = ?")
      : this.db.prepare("SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL")
    const total = (severity ? totalStmt.get(severity) : totalStmt.get()) as { c: number }

    res.json({
      issues: rows,
      total: total.c,
      limit: numLimit,
      offset: numOffset,
    })
  })
}
