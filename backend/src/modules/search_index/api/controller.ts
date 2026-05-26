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

  private generateSnippet(content: string, query: string): string {
    const maxLen = 150
    if (!content) return ""
    if (content.length <= maxLen) return content

    // Simple snippet: try to find first match position, else return start
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const idx = lowerContent.indexOf(lowerQuery)
    if (idx === -1) {
      return content.substring(0, maxLen) + "..."
    }

    const start = Math.max(0, idx - 40)
    const end = Math.min(content.length, start + maxLen)
    let snippet = content.substring(start, end)
    if (start > 0) snippet = "..." + snippet
    if (end < content.length) snippet = snippet + "..."
    return snippet
  }
}
