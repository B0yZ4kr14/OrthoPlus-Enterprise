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
  author?: string
  featureNumber?: string
  dateFrom?: number
  dateTo?: number
}

export interface ContextBriefDocument {
  sourcePath: string
  docType: string
  relevance: number
  summary: string
}

export interface ContextBrief {
  topic: string
  tokenCount: number
  documents: ContextBriefDocument[]
  markdown: string
  confidentialExcluded: number
}

export interface DriftIssue {
  type: "missing_impl" | "broken_ref" | "outdated_decision" | "orphan_doc"
  severity: "low" | "medium" | "high" | "critical"
  sourceDocument: string
  targetDocument?: string
  description: string
}

export interface HealthMetrics {
  indexStatus: "healthy" | "empty"
  totalDocuments: number
  compressionRatio: number
  compressedEmbeddings: number
  spaceSavedBytes: number
  lastScan: string | null
  driftCount: number
  coveragePercent: number
}
