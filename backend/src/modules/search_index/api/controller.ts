import { prisma } from "@/infrastructure/database/prismaClient"
import { Request, Response } from "express"
import { asyncHandler, Errors } from "@/middleware/errorHandler"
import { PacienteIndexer } from "../services/PacienteIndexer"
import { AgendaIndexer } from "../services/AgendaIndexer"
import { PepIndexer } from "../services/PepIndexer"
import {
  getSearchCache,
  setSearchCache,
  invalidateSearchCache,
} from "@/infrastructure/cache/searchCache"
import { logger } from "@/infrastructure/logger"
import { redisInstance } from "@/infrastructure/redis/redisClient"

export interface SearchResultItem {
  id: string
  entityType: string
  entityId: string
  title: string
  snippet: string
  score: number
  module: string
}

export interface SearchResponse {
  total: number
  page: number
  limit: number
  results: SearchResultItem[]
}

interface SearchRow {
  id: string
  entity_type: string
  entity_id: string
  title: string
  content: string
  module: string
  score: number
}

const SEARCH_CACHE_TTL_MS = 60 * 1000 // 60 seconds

export class SearchIndexController {
  private indexer = new PacienteIndexer(prisma)
  private agendaIndexer = new AgendaIndexer(prisma)
  private pepIndexer = new PepIndexer(prisma)

  search = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const q = req.query.q as string | undefined
    if (!q || q.trim().length === 0) {
      throw Errors.validation("Query parameter 'q' is required")
    }

    const moduleFilter = req.query.module as string | undefined
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) || "20", 10))
    )
    const offset = (page - 1) * limit

    const query = q.trim()

    // Check cache first
    const cached = await getSearchCache(clinicId, query, moduleFilter, page, limit)
    if (cached) {
      logger.info(`[SearchCache HIT] clinic=${clinicId} query="${query}"`)
      res.json(cached)
      return
    }

    // Run search query and count in parallel
    const [results, countResult] = await Promise.all([
      this.runSearch(query, clinicId, moduleFilter, limit, offset),
      this.runCount(query, clinicId, moduleFilter),
    ])

    const total = Number(countResult[0]?.count || 0)

    const items: SearchResultItem[] = results.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      title: row.title,
      snippet: this.generateSnippet(row.content, query),
      score: Number(row.score),
      module: row.module,
    }))

    const response: SearchResponse = {
      total,
      page,
      limit,
      results: items,
    }

    // Store in cache
    await setSearchCache(
      clinicId,
      query,
      moduleFilter,
      page,
      limit,
      response,
      SEARCH_CACHE_TTL_MS
    )
    logger.info(
      `[SearchCache MISS] clinic=${clinicId} query="${query}" — stored in cache`
    )

    res.json(response)
  })

  private async runSearch(
    query: string,
    clinicId: string,
    moduleFilter: string | undefined,
    limit: number,
    offset: number
  ): Promise<SearchRow[]> {
    if (moduleFilter) {
      return prisma.$queryRaw<SearchRow[]>`
        SELECT id, entity_type, entity_id, clinic_id, title, content, module, updated_at,
               ts_rank(content_tsv, websearch_to_tsquery('portuguese', ${query})) as score
        FROM core.search_index
        WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
          AND clinic_id = ${clinicId}
          AND module = ${moduleFilter}
        ORDER BY score DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return prisma.$queryRaw<SearchRow[]>`
      SELECT id, entity_type, entity_id, clinic_id, title, content, module, updated_at,
             ts_rank(content_tsv, websearch_to_tsquery('portuguese', ${query})) as score
      FROM core.search_index
      WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
        AND clinic_id = ${clinicId}
      ORDER BY score DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  }

  private async runCount(
    query: string,
    clinicId: string,
    moduleFilter: string | undefined
  ): Promise<[{ count: bigint }]> {
    if (moduleFilter) {
      return prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM core.search_index
        WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
          AND clinic_id = ${clinicId}
          AND module = ${moduleFilter}
      `
    }

    return prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM core.search_index
      WHERE content_tsv @@ websearch_to_tsquery('portuguese', ${query})
        AND clinic_id = ${clinicId}
    `
  }

  private async runReindex(
    indexer: {
      fullReindex(force?: boolean): Promise<{ indexed: number; durationMs: number }>
      incremental(since: Date): Promise<{ indexed: number; durationMs: number }>
    },
    req: Request
  ): Promise<{ indexed: number; durationMs: number }> {
    const { force, since } = req.body as { force?: boolean; since?: string }

    if (force && since) {
      throw Errors.validation("force e since sao mutuamente exclusivos")
    }

    if (force) {
      return indexer.fullReindex(true)
    } else if (since) {
      const sinceDate = new Date(since)
      if (isNaN(sinceDate.getTime())) {
        throw Errors.validation("since deve ser uma data ISO valida")
      }
      return indexer.incremental(sinceDate)
    } else {
      throw Errors.validation("Especifique force=true ou since=<data_iso>")
    }
  }

  reindexPacientes = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    const result = await this.runReindex(this.indexer, req)
    if (clinicId) {
      await invalidateSearchCache(clinicId)
    }
    res.json({ indexed: result.indexed, durationMs: result.durationMs })
  })

  reindexAgenda = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    const result = await this.runReindex(this.agendaIndexer, req)
    if (clinicId) {
      await invalidateSearchCache(clinicId)
    }
    res.json({ indexed: result.indexed, durationMs: result.durationMs })
  })

  reindexPep = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    const result = await this.runReindex(this.pepIndexer, req)
    if (clinicId) {
      await invalidateSearchCache(clinicId)
    }
    res.json({ indexed: result.indexed, durationMs: result.durationMs })
  })

  health = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const startTime = Date.now()
    const checks: Record<string, { status: "ok" | "error"; details?: string; latencyMs?: number }> = {}
    let overall = "healthy"

    // 1. PostgreSQL FTS check
    try {
      const pgStart = Date.now()
      await prisma.$queryRaw`SELECT 1 as ping`
      const pgRows = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM core.search_index WHERE clinic_id = ${clinicId}
      `
      const totalIndex = Number(pgRows[0]?.count || 0)
      checks.postgresql = {
        status: "ok",
        details: `${totalIndex} indexed records`,
        latencyMs: Date.now() - pgStart,
      }
    } catch (err) {
      checks.postgresql = {
        status: "error",
        details: err instanceof Error ? err.message : String(err),
      }
      overall = "degraded"
    }

    // 2. Redis check
    try {
      const redisStart = Date.now()
      await redisInstance.ping()
      checks.redis = {
        status: "ok",
        latencyMs: Date.now() - redisStart,
      }
    } catch (err) {
      checks.redis = {
        status: "error",
        details: err instanceof Error ? err.message : String(err),
      }
      overall = "degraded"
    }

    // 3. Search index recency check
    try {
      const recencyRows = await prisma.$queryRaw<{ max_updated: Date | null }[]>`
        SELECT MAX(updated_at) as max_updated FROM core.search_index WHERE clinic_id = ${clinicId}
      `
      const lastUpdate = recencyRows[0]?.max_updated
      checks.indexRecency = {
        status: "ok",
        details: lastUpdate
          ? `Last update: ${lastUpdate.toISOString()}`
          : "No indexed records",
      }
    } catch (err) {
      checks.indexRecency = {
        status: "error",
        details: err instanceof Error ? err.message : String(err),
      }
      overall = "degraded"
    }

    res.status(overall === "healthy" ? 200 : 503).json({
      status: overall,
      module: "search_index",
      clinicId,
      latencyMs: Date.now() - startTime,
      checks,
    })
  })

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  private highlightTerms(text: string, query: string): string {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 3)
    if (terms.length === 0) return text

    // Sort by length descending so longer terms match first
    const sortedTerms = [...terms].sort((a, b) => b.length - a.length)
    const pattern = sortedTerms
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")
    const regex = new RegExp(`(${pattern})`, "gi")

    return text.replace(regex, "<mark>$1</mark>")
  }

  private generateSnippet(content: string, query: string): string {
    const maxLen = 150
    if (!content) return ""

    const escaped = this.escapeHtml(content)
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 3)

    if (terms.length === 0) {
      return escaped.length <= maxLen ? escaped : escaped.substring(0, maxLen) + "..."
    }

    if (escaped.length <= maxLen) {
      return this.highlightTerms(escaped, query)
    }

    const lowerEscaped = escaped.toLowerCase()

    // Find first occurrence of any term
    let firstMatchIndex = -1
    for (const term of terms) {
      const idx = lowerEscaped.indexOf(term)
      if (idx !== -1 && (firstMatchIndex === -1 || idx < firstMatchIndex)) {
        firstMatchIndex = idx
      }
    }

    if (firstMatchIndex === -1) {
      return escaped.substring(0, maxLen) + "..."
    }

    // Build window around first match with context
    const contextBefore = 40
    let start = Math.max(0, firstMatchIndex - contextBefore)
    let end = Math.min(escaped.length, start + maxLen)

    // If window hits the end, shift start back to fill maxLen
    if (end === escaped.length && end - start < maxLen) {
      start = Math.max(0, end - maxLen)
    }

    const prefix = start > 0 ? "..." : ""
    const suffix = end < escaped.length ? "..." : ""
    const snippet = escaped.substring(start, end)

    return this.highlightTerms(prefix + snippet + suffix, query)
  }
}
