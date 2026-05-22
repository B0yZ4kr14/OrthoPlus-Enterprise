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
  dateRange?: { start: string; end: string }
  author?: string
  featureNumber?: string
}

export interface HealthMetrics {
  totalDocuments: number
  coveragePercent: number
  driftCount: number
  lastScan: string
}

export interface ContextBrief {
  topic: string
  tokenCount: number
  documents: Array<{
    sourcePath: string
    docType: string
    relevance: number
    summary: string
  }>
  markdown: string
  confidentialExcluded: number
}

export interface GraphNode {
  id: string
  label: string
  docType: string
  sourcePath: string
}

export interface GraphEdge {
  source: string
  target: string
  type: "links-to" | "referenced-by"
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
