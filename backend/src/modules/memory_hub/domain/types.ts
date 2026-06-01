/**
 * Core domain types for Memory Hub.
 */

export interface MemoryDocument {
  id: string
  clinicId: string
  sourcePath: string
  docType: string
  title: string
  contentHash: string
  lastIndexed: number
  lastModified: number
  author: string | null
  featureNumber: string | null
  version: number
  wordCount: number
  isArchived: boolean
  frontmatter: string
}

export interface EmbeddingInput {
  chunkId: string
  embedding: number[]
  model: string
  createdAt: number
}

export interface EmbeddingSearchResult {
  chunkId: string
  documentId: string
  sourcePath: string
  content: string
  headingPath: string
  relevanceScore: number
}

export interface DriftIssue {
  type: "missing_impl" | "broken_ref" | "outdated_decision" | "orphan_doc" | "contradictory_spec" | "overlapping_scope"
  severity: "low" | "medium" | "high" | "critical"
  sourceDocument: string
  targetDocument?: string
  description: string
}

export interface CostRecord {
  id: string
  clinicId: string
  queryText: string
  tokens: number
  costUsd: number
  provider: string
  model: string
  timestamp: number
}
