import Database from "better-sqlite3";
import fs from "fs";
import { logger } from "@/infrastructure/logger";

export class SqliteHealthChecker {
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  checkIntegrity(): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    try {
      const db = new Database(this.dbPath, { readonly: true });
      const result = db.pragma("integrity_check") as Array<{
        integrity_check: string;
      }>;
      db.close();

      const status = result[0]?.integrity_check || "unknown";
      if (status !== "ok") {
        errors.push(`Integrity check failed: ${status}`);
      }
      return { ok: status === "ok", errors };
    } catch (err) {
      errors.push(
        `Failed to open database: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { ok: false, errors };
    }
  }

  rebuildFromBackup(backupPath: string): void {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }
    fs.copyFileSync(backupPath, this.dbPath);
    logger.info("[SqliteHealthChecker] Rebuilt index from backup", {
      dbPath: this.dbPath,
      backupPath,
    });
  }

  createBackup(backupPath: string): void {
    fs.copyFileSync(this.dbPath, backupPath);
    logger.info("[SqliteHealthChecker] Created backup", {
      dbPath: this.dbPath,
      backupPath,
    });
  }
}
