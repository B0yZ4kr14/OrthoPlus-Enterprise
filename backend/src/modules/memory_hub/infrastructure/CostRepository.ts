import Database from "better-sqlite3";
import { ICostRepository } from "../domain/ports/ICostRepository";
import { CostRecord } from "../domain/types";

export class CostRepository implements ICostRepository {
  constructor(private db: Database.Database) {}

  ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embedding_costs (
        id TEXT PRIMARY KEY,
        clinic_id TEXT NOT NULL,
        query_text TEXT,
        tokens INTEGER NOT NULL,
        cost_usd REAL NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_costs_clinic_month ON embedding_costs(clinic_id, timestamp);
    `);
  }

  insert(record: Omit<CostRecord, "id">): CostRecord {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(
      `INSERT INTO embedding_costs (id, clinic_id, query_text, tokens, cost_usd, provider, model, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    stmt.run(
      id,
      record.clinicId,
      record.queryText,
      record.tokens,
      record.costUsd,
      record.provider,
      record.model,
      record.timestamp,
    );
    return { ...record, id };
  }

  getMonthlySummary(
    clinicId: string,
    startMs: number,
    endMs: number,
  ): {
    total_tokens: number
    total_cost: number
    query_count: number
  } {
    const row = this.db
      .prepare(
        `SELECT
          COALESCE(SUM(tokens), 0) as total_tokens,
          COALESCE(SUM(cost_usd), 0) as total_cost,
          COUNT(*) as query_count
         FROM embedding_costs
         WHERE clinic_id = ? AND timestamp >= ? AND timestamp < ?`,
      )
      .get(clinicId, startMs, endMs) as {
      total_tokens: number;
      total_cost: number;
      query_count: number;
    };
    return row;
  }
}
