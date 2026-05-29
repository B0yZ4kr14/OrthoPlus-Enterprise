import { prisma } from "@/infrastructure/database/prismaClient";
import { Pool } from "pg";
import type { CategoryBackupService } from "./CategoryBackupService";

export interface CategoryHealthResult {
  status: "healthy" | "degraded" | "down";
  schemas: string[];
  latencyMs: number;
}

export interface CategoryStatsResult {
  schemas: string[];
  tableCount: number;
  sizeBytes: number;
  sizeHuman: string;
  lastBackup: string | null;
}

export interface CategoryMaintenanceResult {
  vacuum: boolean;
  analyze: boolean;
  reindex: boolean;
}

export class CategoryDatabaseManager {
  private pgPool: Pool | null = null;

  constructor(
    protected readonly schemas: string[],
    protected readonly categoryName: string,
    protected readonly backupService?: CategoryBackupService,
  ) {}

  /** Lazy pg Pool for operations that cannot run inside Prisma transactions (VACUUM, REINDEX) */
  private getPool(): Pool {
    if (!this.pgPool) {
      const url = process.env.DATABASE_URL ?? "";
      this.pgPool = new Pool({ connectionString: url });
    }
    return this.pgPool;
  }

  async getHealth(): Promise<CategoryHealthResult> {
    const start = Date.now();
    try {
      const result = await prisma.$queryRaw<{ schema_name: string }[]>`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = ANY(${this.schemas}::text[])
      `;
      const foundSchemas = result.map((r) => r.schema_name);
      const latencyMs = Date.now() - start;
      const allPresent = this.schemas.every((s) => foundSchemas.includes(s));
      return {
        status: allPresent ? "healthy" : "degraded",
        schemas: this.schemas,
        latencyMs,
      };
    } catch {
      return {
        status: "down",
        schemas: this.schemas,
        latencyMs: Date.now() - start,
      };
    }
  }

  async getStats(): Promise<CategoryStatsResult> {
    try {
      const tableCountResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = ANY(${this.schemas}::text[])
          AND table_type = 'BASE TABLE'
      `;
      const tableCount = Number(tableCountResult[0]?.count ?? 0);

      const sizeResult = await prisma.$queryRaw<{ total_size: bigint }[]>`
        SELECT COALESCE(SUM(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))), 0) as total_size
        FROM pg_tables
        WHERE schemaname = ANY(${this.schemas}::text[])
      `;
      const sizeBytes = Number(sizeResult[0]?.total_size ?? 0);
      const sizeHuman = this.formatBytes(sizeBytes);

      let lastBackup: string | null = null;
      if (this.backupService) {
        const info = await this.backupService.getLastBackupInfo();
        lastBackup = info.lastBackup;
      }

      return {
        schemas: this.schemas,
        tableCount,
        sizeBytes,
        sizeHuman,
        lastBackup,
      };
    } catch {
      return {
        schemas: this.schemas,
        tableCount: 0,
        sizeBytes: 0,
        sizeHuman: "0 B",
        lastBackup: null,
      };
    }
  }

  async runMaintenance(): Promise<CategoryMaintenanceResult> {
    const result: CategoryMaintenanceResult = {
      vacuum: false,
      analyze: false,
      reindex: false,
    };

    const pool = this.getPool();

    for (const schema of this.schemas) {
      let tables: { tablename: string }[] = [];
      try {
        const res = await pool.query<{ tablename: string }>(
          "SELECT tablename FROM pg_tables WHERE schemaname = $1",
          [schema],
        );
        tables = res.rows;
      } catch {
        continue;
      }

      for (const { tablename } of tables) {
        const qualified = `"${schema}"."${tablename}"`;

        try {
          // VACUUM must run outside a transaction block — pg Pool satisfies this
          await pool.query(`VACUUM ANALYZE ${qualified}`);
          result.vacuum = true;
          result.analyze = true;
        } catch {
          // non-fatal: table may be locked or in use
        }

        try {
          await pool.query(`REINDEX TABLE ${qualified}`);
          result.reindex = true;
        } catch {
          // non-fatal
        }
      }
    }

    return result;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
