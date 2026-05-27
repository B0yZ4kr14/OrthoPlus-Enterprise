/**
 * Port (interface) for search audit repository operations.
 * Tracks search queries for analytics, compliance, and cost monitoring.
 */
export interface SearchAuditEntry {
  id: string
  clinicId: string
  userId: string | null
  queryText: string
  resultsCount: number
  durationMs: number
  timestamp: number
}

export interface ISearchAuditRepository {
  logQuery(
    clinicId: string,
    userId: string | null,
    queryText: string,
    resultsCount: number,
    durationMs: number,
  ): void

  getRecentQueries(clinicId: string, limit?: number): SearchAuditEntry[]
}
