import Database from "better-sqlite3";
import { IDriftRepository } from "../domain/ports/IDriftRepository";

export class DriftRepository implements IDriftRepository {
  constructor(private db: Database.Database) {}

  findUnresolved(options: {
    severity?: string;
    limit: number;
    offset: number;
  }): Array<Record<string, unknown>> {
    const { severity, limit, offset } = options;
    if (severity) {
      const stmt = this.db.prepare(
        "SELECT * FROM drift_reports WHERE resolved_at IS NULL AND severity = ? ORDER BY detected_at DESC LIMIT ? OFFSET ?",
      );
      return stmt.all(severity, limit, offset) as Array<
        Record<string, unknown>
      >;
    }
    const stmt = this.db.prepare(
      "SELECT * FROM drift_reports WHERE resolved_at IS NULL ORDER BY detected_at DESC LIMIT ? OFFSET ?",
    );
    return stmt.all(limit, offset) as Array<Record<string, unknown>>;
  }

  countUnresolved(severity?: string): number {
    if (severity) {
      const stmt = this.db.prepare(
        "SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL AND severity = ?",
      );
      const row = stmt.get(severity) as { c: number };
      return row.c;
    }
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL",
    );
    const row = stmt.get() as { c: number };
    return row.c;
  }
}
