import Database from "better-sqlite3"
import crypto from "crypto"
import { ISearchAuditRepository, SearchAuditEntry } from "../domain/ports/ISearchAuditRepository"

export class SearchAuditRepository implements ISearchAuditRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  logQuery(
    clinicId: string,
    userId: string | null,
    queryText: string,
    resultsCount: number,
    durationMs: number,
  ): void {
    const stmt = this.db.prepare(
      `INSERT INTO search_queries (id, clinic_id, user_id, query_text, results_count, duration_ms, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    stmt.run(
      crypto.randomUUID(),
      clinicId,
      userId,
      queryText,
      resultsCount,
      durationMs,
      Date.now(),
    )
  }

  getRecentQueries(clinicId: string, limit = 100): SearchAuditEntry[] {
    const stmt = this.db.prepare(
      `SELECT id, clinic_id as clinicId, user_id as userId, query_text as queryText,
              results_count as resultsCount, duration_ms as durationMs, timestamp
       FROM search_queries
       WHERE clinic_id = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
    )
    return stmt.all(clinicId, limit) as SearchAuditEntry[]
  }
}
