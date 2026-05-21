import { logger } from "@/infrastructure/logger"
import { OllamaEmbeddingClient } from "../../infrastructure/OllamaEmbeddingClient"
import { EmbeddingRepository } from "../../infrastructure/EmbeddingRepository"

export interface SearchResult {
  id: string
  sourcePath: string
  docType: string
  title: string
  excerpt: string
  relevanceScore: number
  headingPath: string[]
}

export interface SearchFilters {
  docTypes?: string[]
  excludeArchived?: boolean
}

export class SearchService {
  private embedder: OllamaEmbeddingClient
  private embeddings: EmbeddingRepository

  constructor(embedder: OllamaEmbeddingClient, embeddings: EmbeddingRepository) {
    this.embedder = embedder
    this.embeddings = embeddings
  }

  async search(
    query: string,
    filters: SearchFilters = {},
    limit = 10,
    offset = 0,
  ): Promise<{ results: SearchResult[]; total: number }> {
    const startTime = Date.now()

    const embedding = await this.embedder.embedSingle(query)
    const rawResults = this.embeddings.searchSimilar(
      embedding.embedding,
      embedding.model,
      limit + offset,
    )

    // Apply filters
    const filtered = rawResults
    if (filters.docTypes && filters.docTypes.length > 0) {
      // We need docType info which isn't in the embedding query result
      // For MVP, we'll skip docType filtering at the embedding level
      // and apply it in the controller if needed
    }

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
