import { logger } from "@/infrastructure/logger"
import { IEmbeddingClient } from "../ports/IEmbeddingClient"
import { IEmbeddingRepository } from "../ports/IEmbeddingRepository"
import { IDocumentRepository } from "../ports/IDocumentRepository"
import type { SearchResult } from "@orthoplus/shared-types"

export interface SearchFilters {
  docTypes?: string[]
  excludeArchived?: boolean
  author?: string
  featureNumber?: string
  dateFrom?: number // timestamp ms
  dateTo?: number // timestamp ms
}

export class SearchService {
  private embedder: IEmbeddingClient
  private embeddings: IEmbeddingRepository
  private documents: IDocumentRepository

  constructor(embedder: IEmbeddingClient, embeddings: IEmbeddingRepository, documents: IDocumentRepository) {
    this.embedder = embedder
    this.embeddings = embeddings
    this.documents = documents
  }

  async search(
    query: string,
    filters: SearchFilters = {},
    limit = 10,
    offset = 0,
    clinicId = "default",
  ): Promise<{ results: SearchResult[]; total: number }> {
    const startTime = Date.now()

    const embedding = await this.embedder.embedSingle(query)
    const rawResults = this.embeddings.searchSimilar(
      embedding.embedding,
      embedding.model,
      limit + offset,
      filters.docTypes,
      clinicId,
      filters.author,
      filters.featureNumber,
      filters.dateFrom,
      filters.dateTo,
    )

    const filtered = rawResults

    // Deduplicate by document, keep highest scoring chunk per doc
    const byDocument = new Map<string, typeof rawResults[0]>()
    for (const r of filtered) {
      const existing = byDocument.get(r.documentId)
      if (!existing || r.relevanceScore > existing.relevanceScore) {
        byDocument.set(r.documentId, r)
      }
    }

    const deduped = Array.from(byDocument.values())
    deduped.sort((a, b) => b.relevanceScore - a.relevanceScore)

    const paginated = deduped.slice(offset, offset + limit)

    const results: SearchResult[] = paginated.map((r) => ({
      id: r.chunkId,
      sourcePath: r.sourcePath,
      docType: this.inferDocType(r.sourcePath),
      title: this.inferTitle(r.sourcePath),
      excerpt: this.truncate(r.content, 300),
      relevanceScore: Math.round(r.relevanceScore * 100) / 100,
      headingPath: this.safeJsonParse(r.headingPath),
    }))

    const duration = Date.now() - startTime
    logger.info(`[SearchService] Query completed`, { query, resultCount: results.length, durationMs: duration })

    return { results, total: deduped.length }
  }

  async searchWithConfidentialityFilter(
    query: string,
    filters: SearchFilters = {},
    limit = 10,
    offset = 0,
    clinicId = "default",
  ): Promise<{ results: SearchResult[]; total: number; confidentialExcluded: number }> {
    const { results, total } = await this.search(query, filters, limit, offset, clinicId)

    let confidentialExcluded = 0
    const filteredResults = results.filter((r) => {
      const doc = this.documents.findByPath(r.sourcePath, clinicId)
      if (!doc) return false
      if (this.documents.isConfidential(doc)) {
        confidentialExcluded++
        return false
      }
      return true
    })

    return { results: filteredResults, total, confidentialExcluded }
  }

  private inferDocType(sourcePath: string): string {
    if (sourcePath.includes("specs/")) return "spec"
    if (sourcePath.includes("plans/") || sourcePath.includes("plan.md")) return "plan"
    if (sourcePath.includes("architecture")) return "architecture"
    if (sourcePath.includes("contracts/")) return "contract"
    if (sourcePath.includes(".specify/memory/")) return "memory"
    if (sourcePath.includes(".omk/memory/")) return "memory"
    return "doc"
  }

  private inferTitle(sourcePath: string): string {
    const parts = sourcePath.split("/")
    const fileName = parts[parts.length - 1] || sourcePath
    return fileName.replace(/\.md$/, "").replace(/[-_]/g, " ")
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  private safeJsonParse(input: string): string[] {
    try {
      return JSON.parse(input)
    } catch {
      return []
    }
  }
}
