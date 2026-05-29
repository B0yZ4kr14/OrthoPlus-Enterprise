export type {
  SearchResult,
  ContextBrief,
  GraphNode,
  GraphEdge,
  GraphData,
} from "@orthoplus/shared-types";

export interface SearchFilters {
  docTypes?: string[];
  dateRange?: { start: string; end: string };
  author?: string;
  featureNumber?: string;
}

export interface HealthMetrics {
  totalDocuments: number;
  coveragePercent: number;
  driftCount: number;
  lastScan: string;
}
