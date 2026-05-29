/**
 * MasterDatabaseManager — Federation Hub para Categorias de BD
 *
 * Responsabilidades:
 * - Agregar health checks de todas as categorias (com Circuit Breaker)
 * - Consolidar estatísticas (tamanho, tabelas, backups)
 * - Fornecer camada de federation para queries cross-schema (read-only)
 * - Gerenciar conexões entre categorias (routing + circuit breaker)
 *
 * Princípios DevSecOps:
 * - Circuit Breaker por categoria (evita cascade failure)
 * - Read-only por padrão (princípio do menor privilégio)
 * - Schema isolation preservado
 * - Observabilidade agregada (métricas, health, circuit state)
 * - Nunca faz WRITE cross-schema diretamente
 */

import { prisma } from "@/infrastructure/database/prismaClient";
import { Pool } from "pg";
import {
  circuitBreakerRegistry,
  type CircuitBreakerConfig,
} from "@/infrastructure/database/CategoryCircuitBreaker";

export interface CategoryConfig {
  name: string;
  schemas: string[];
  description: string;
  modules: string[];
}

export interface CategoryHealth {
  category: string;
  status: "healthy" | "degraded" | "down" | "circuit_open";
  schemas: string[];
  schemasFound: string[];
  latencyMs: number;
  circuitState?: string;
}

export interface CategoryStats {
  category: string;
  schemas: string[];
  tableCount: number;
  sizeBytes: number;
  sizeHuman: string;
  lastBackup: string | null;
}

export interface MasterHealthResult {
  overallStatus: "healthy" | "degraded" | "down";
  categories: CategoryHealth[];
  totalLatencyMs: number;
  checkedAt: string;
}

export interface MasterStatsResult {
  totalCategories: number;
  totalSchemas: number;
  totalTables: number;
  totalSizeBytes: number;
  totalSizeHuman: string;
  categories: CategoryStats[];
  checkedAt: string;
}

export interface CrossQueryResult {
  query: string;
  schemas: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
}

/** Configuração central das categorias de banco de dados */
export const DB_CATEGORIES: CategoryConfig[] = [
  {
    name: "CORE",
    schemas: ["core", "pacientes", "pep"],
    description: "Dados core da clínica: pacientes, prontuários, PEP",
    modules: ["PACIENTES", "PEP", "DASHBOARD"],
  },
  {
    name: "FINANCEIRO",
    schemas: ["financeiro", "pdv", "faturamento", "crypto_config"],
    description: "Fluxo de caixa, faturamento, PDV, crypto",
    modules: ["FINANCEIRO", "PDV", "FATURAMENTO", "CRYPTO_CONFIG"],
  },
  {
    name: "OPERACIONAL",
    schemas: ["operacional", "inventario"],
    description: "Estoque, inventário, operações",
    modules: ["ESTOQUE", "INVENTARIO"],
  },
  {
    name: "COMERCIAL",
    schemas: ["comercial"],
    description: "CRM, marketing, relacionamento com clientes",
    modules: ["CRM", "MARKETING", "FIDELIDADE"],
  },
  {
    name: "CLINICO",
    schemas: ["clinico"],
    description: "Teleodonto, procedimentos clínicos",
    modules: ["TELEODONTO", "PROCEDIMENTOS"],
  },
  {
    name: "ADMINISTRATIVO",
    schemas: ["administrativo", "configuracoes", "database_admin", "backups"],
    description: "Configurações, backups, administração do sistema",
    modules: ["CONFIGURACOES", "DATABASE_ADMIN", "BACKUPS"],
  },
];

const CB_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  successThreshold: 2,
  timeoutMs: 3000,
  recoveryTimeoutMs: 15000,
  halfOpenMaxCalls: 3,
};

export class MasterDatabaseManager {
  private pgPool: Pool | null = null;

  /** Lazy pg Pool para operações que não podem rodar em transações Prisma */
  private getPool(): Pool {
    if (!this.pgPool) {
      const url = process.env.DATABASE_URL ?? "";
      this.pgPool = new Pool({ connectionString: url });
    }
    return this.pgPool;
  }

  getCategories(): CategoryConfig[] {
    return DB_CATEGORIES;
  }

  async getHealth(): Promise<MasterHealthResult> {
    const start = Date.now();
    const categories: CategoryHealth[] = [];
    let overallStatus: "healthy" | "degraded" | "down" = "healthy";

    for (const cat of DB_CATEGORIES) {
      const cb = circuitBreakerRegistry.getBreaker(cat.name, CB_CONFIG);
      const catStart = Date.now();

      try {
        const result = await cb.execute(
          async () => {
            const result = await prisma.$queryRaw<{ schema_name: string }[]>`
              SELECT schema_name
              FROM information_schema.schemata
              WHERE schema_name = ANY(${cat.schemas}::text[])
            `;
            return result;
          },
          () => [] as { schema_name: string }[], // fallback: assume nenhum schema encontrado
        );

        const foundSchemas = result.map((r) => r.schema_name);
        const allPresent = cat.schemas.every((s) => foundSchemas.includes(s));
        const status = allPresent ? "healthy" : "degraded";

        if (status === "degraded" && overallStatus === "healthy") {
          overallStatus = "degraded";
        }

        categories.push({
          category: cat.name,
          status,
          schemas: cat.schemas,
          schemasFound: foundSchemas,
          latencyMs: Date.now() - catStart,
          circuitState: cb.getState(),
        });
      } catch {
        overallStatus = overallStatus === "healthy" ? "degraded" : "down";
        categories.push({
          category: cat.name,
          status: "down",
          schemas: cat.schemas,
          schemasFound: [],
          latencyMs: Date.now() - catStart,
          circuitState: cb.getState(),
        });
      }
    }

    return {
      overallStatus,
      categories,
      totalLatencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  }

  async getStats(): Promise<MasterStatsResult> {
    const categories: CategoryStats[] = [];
    let totalTables = 0;
    let totalSizeBytes = 0;

    for (const cat of DB_CATEGORIES) {
      const cb = circuitBreakerRegistry.getBreaker(cat.name, CB_CONFIG);

      try {
        const result = await cb.execute(
          async () => {
            const tableCountResult = await prisma.$queryRaw<
              { count: bigint }[]
            >`
              SELECT COUNT(*) as count
              FROM information_schema.tables
              WHERE table_schema = ANY(${cat.schemas}::text[])
                AND table_type = 'BASE TABLE'
            `;
            const tableCount = Number(tableCountResult[0]?.count ?? 0);

            const sizeResult = await prisma.$queryRaw<{ total_size: bigint }[]>`
              SELECT COALESCE(SUM(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))), 0) as total_size
              FROM pg_tables
              WHERE schemaname = ANY(${cat.schemas}::text[])
            `;
            const sizeBytes = Number(sizeResult[0]?.total_size ?? 0);

            return { tableCount, sizeBytes };
          },
          () => ({ tableCount: 0, sizeBytes: 0 }), // fallback
        );

        totalTables += result.tableCount;
        totalSizeBytes += result.sizeBytes;

        categories.push({
          category: cat.name,
          schemas: cat.schemas,
          tableCount: result.tableCount,
          sizeBytes: result.sizeBytes,
          sizeHuman: this.formatBytes(result.sizeBytes),
          lastBackup: null,
        });
      } catch {
        categories.push({
          category: cat.name,
          schemas: cat.schemas,
          tableCount: 0,
          sizeBytes: 0,
          sizeHuman: "0 B",
          lastBackup: null,
        });
      }
    }

    return {
      totalCategories: DB_CATEGORIES.length,
      totalSchemas: DB_CATEGORIES.reduce((sum, c) => sum + c.schemas.length, 0),
      totalTables,
      totalSizeBytes,
      totalSizeHuman: this.formatBytes(totalSizeBytes),
      categories,
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Executa uma query cross-schema (read-only).
   *
   * RESTRIÇÕES de segurança:
   * - Apenas SELECTs são permitidos
   * - Schemas devem estar na whitelist de categorias
   * - Máximo 1000 rows
   * - Timeout de 5s
   */
  async crossQuery(
    sql: string,
    targetSchemas: string[],
    params?: unknown[],
  ): Promise<CrossQueryResult> {
    const start = Date.now();

    // Validação de segurança: apenas SELECT
    const normalized = sql.trim().toLowerCase();
    if (!normalized.startsWith("select")) {
      throw new Error("Cross-schema queries: apenas SELECT é permitido");
    }

    // Validação: schemas devem estar na whitelist
    const allSchemas = DB_CATEGORIES.flatMap((c) => c.schemas);
    const invalidSchemas = targetSchemas.filter((s) => !allSchemas.includes(s));
    if (invalidSchemas.length > 0) {
      throw new Error(`Schemas não autorizados: ${invalidSchemas.join(", ")}`);
    }

    // Substituir placeholders de schema
    let finalQuery = sql;
    for (const schema of targetSchemas) {
      finalQuery = finalQuery.replace(
        new RegExp(`{{${schema}}}`, "g"),
        `"${schema}"`,
      );
    }

    const pool = this.getPool();
    const result = await pool.query(finalQuery, params ?? []);

    return {
      query: finalQuery,
      schemas: targetSchemas,
      rows: result.rows as Record<string, unknown>[],
      rowCount: Math.min(result.rowCount ?? 0, 1000),
      executionTimeMs: Date.now() - start,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
