import crypto from "crypto";
import { z } from "zod";
import { db } from "@/infrastructure/database/connection";
import { logger } from "@/infrastructure/logger";
import { AuditLogRepository } from "@/modules/database_admin/infrastructure/AuditLogRepository";
import { DatabaseHealth } from "@/modules/database_admin/domain/entities/DatabaseHealth";
import type { SlowQuery } from "@orthoplus/shared-types";

export interface HealthResult {
  health: ReturnType<DatabaseHealth["toJSON"]>;
  isHealthy: boolean;
  needsMaintenance: boolean;
}

export interface PoolStats {
  maxConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  connectionsByModule: Record<string, number>;
}

export interface MaintenanceResult {
  success: boolean;
  operation: string;
  startedAt: Date;
  message: string;
}

export class DatabaseAdminControllerService {
  constructor(
    private auditRepo: AuditLogRepository = new AuditLogRepository(),
  ) {}

  async getHealth(clinicId: string): Promise<HealthResult> {
    let activeConnections = 0;
    let idleConnections = 0;
    let connectionPoolSize = 0;
    try {
      const connResult = await db.query<{ state: string; count: string }>(`
        SELECT state, COUNT(*) AS count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);
      for (const row of connResult.rows) {
        const count = parseInt(row.count, 10);
        if (row.state === "active") activeConnections = count;
        else if (row.state === "idle") idleConnections = count;
      }
      const maxConnResult = await db.query<{ setting: string }>(
        "SELECT setting FROM pg_settings WHERE name = 'max_connections'",
      );
      if (maxConnResult.rows.length > 0) {
        connectionPoolSize = parseInt(maxConnResult.rows[0].setting, 10);
      }
    } catch (err) {
      logger.warn("Could not query pg_stat_activity for health", { err });
    }

    let slowQueriesCount = 0;
    try {
      const sqResult = await db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count FROM database_admin.slow_queries
        WHERE clinic_id = $1
      `,
        [clinicId],
      );
      slowQueriesCount = parseInt(sqResult.rows[0]?.count ?? "0", 10);
    } catch (err) {
      logger.warn("Could not query slow_queries count for health", { err });
    }

    let averageQueryTime = 0;
    let lastVacuum: Date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    let lastAnalyze: Date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    try {
      const tableStatsResult = await db.query<{
        last_vacuum: Date | null;
        last_analyze: Date | null;
      }>(`
        SELECT
          MAX(last_vacuum) AS last_vacuum,
          MAX(last_analyze) AS last_analyze
        FROM pg_stat_user_tables
      `);
      if (tableStatsResult.rows.length > 0) {
        if (tableStatsResult.rows[0].last_vacuum) {
          lastVacuum = new Date(tableStatsResult.rows[0].last_vacuum);
        }
        if (tableStatsResult.rows[0].last_analyze) {
          lastAnalyze = new Date(tableStatsResult.rows[0].last_analyze);
        }
      }
    } catch (err) {
      logger.warn("Could not query pg_stat_user_tables for health", { err });
    }

    try {
      const avgResult = await db.query<{ avg_time: string | null }>(
        `
        SELECT AVG(execution_time_ms) AS avg_time
        FROM database_admin.slow_queries
        WHERE clinic_id = $1
      `,
        [clinicId],
      );
      const raw = avgResult.rows[0]?.avg_time;
      if (raw !== null && raw !== undefined) {
        averageQueryTime = parseFloat(raw);
      }
    } catch (err) {
      logger.warn("Could not query avg execution time from slow_queries", {
        err,
      });
    }

    const health = new DatabaseHealth({
      id: crypto.randomUUID(),
      clinicId,
      connectionPoolSize,
      activeConnections,
      idleConnections,
      slowQueriesCount,
      averageQueryTime,
      diskUsagePercent: 0,
      lastVacuum,
      lastAnalyze,
      timestamp: new Date(),
    });

    return {
      health: health.toJSON(),
      isHealthy: health.isHealthy(),
      needsMaintenance: health.needsMaintenance(),
    };
  }

  async getAuditLogs(
    clinicId: string,
    filters: { user_id?: string; action?: string; from?: string; to?: string },
  ) {
    const { user_id, action, from, to } = filters;

    const where: Record<string, unknown> = { clinic_id: clinicId };

    if (user_id && user_id !== "all") {
      where.user_id = user_id;
    }

    if (action && action !== "all") {
      where.action = action;
    }

    if (from || to) {
      where.created_at = {} as Record<string, Date>;
      if (from) {
        (where.created_at as Record<string, Date>).gte = new Date(from);
      }
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        (where.created_at as Record<string, Date>).lte = endDate;
      }
    }

    const logs = await this.auditRepo.findLogs({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const userIds = [
      ...new Set(logs.map((l) => l.user_id).filter(Boolean)),
    ] as string[];

    const profiles = await this.auditRepo.findProfiles({
      where: { id: { in: userIds } },
      select: { id: true, full_name: true },
    });

    const profilesMap = profiles.reduce(
      (acc, p) => {
        acc[p.id] = p.full_name;
        return acc;
      },
      {} as Record<string, string | null>,
    );

    return logs.map((l) => ({
      ...l,
      profiles: l.user_id
        ? { full_name: profilesMap[l.user_id] || "Desconhecido" }
        : null,
    }));
  }

  async getSlowQueries(clinicId: string): Promise<SlowQuery[]> {
    let slowQueries: SlowQuery[] = [];

    try {
      const result = await db.query<{
        query_text: string;
        calls: number;
        execution_time_ms: number;
        recorded_at: Date;
      }>(
        `
        SELECT query_text, calls, execution_time_ms, recorded_at
        FROM database_admin.slow_queries
        WHERE clinic_id = $1
        ORDER BY execution_time_ms DESC
        LIMIT 50
      `,
        [clinicId],
      );

      if (result.rows.length > 0) {
        slowQueries = result.rows.map((row) => ({
          query: row.query_text,
          calls: Number(row.calls),
          averageTime: Number(row.execution_time_ms),
          totalTime: Number(row.execution_time_ms) * Number(row.calls),
          lastExecuted: new Date(row.recorded_at),
        }));
      } else {
        try {
          const ssResult = await db.query<{
            query: string;
            calls: string;
            mean_exec_time: string;
            total_exec_time: string;
          }>(`
            SELECT query, calls, mean_exec_time, total_exec_time
            FROM pg_stat_statements
            WHERE mean_exec_time > 100
            ORDER BY mean_exec_time DESC
            LIMIT 50
          `);
          slowQueries = ssResult.rows.map((row) => ({
            query: row.query,
            calls: parseInt(row.calls, 10),
            averageTime: parseFloat(row.mean_exec_time),
            totalTime: parseFloat(row.total_exec_time),
            lastExecuted: new Date(),
          }));
        } catch {
          // pg_stat_statements not available
        }
      }
    } catch (err) {
      logger.warn("Could not query slow_queries table", { err });
    }

    return slowQueries;
  }

  async runMaintenance(
    body: unknown,
    clinicId: string,
    isAdmin: boolean,
  ): Promise<MaintenanceResult> {
    const schema = z.object({
      operation: z.enum(["VACUUM", "ANALYZE", "REINDEX", "VACUUM_FULL"]),
      targetSchema: z.string().optional(),
    });

    const { operation, targetSchema } = schema.parse(body);

    if (!clinicId || !isAdmin) {
      throw new Error("Acesso negado");
    }

    const startedAt = new Date();
    const schemaTarget = targetSchema ?? "public";

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaTarget)) {
      throw new Error("Nome de schema invalido");
    }

    try {
      if (operation === "VACUUM") {
        await db.query(`VACUUM ANALYZE`);
      } else if (operation === "VACUUM_FULL") {
        await db.query(`VACUUM FULL ANALYZE`);
      } else if (operation === "ANALYZE") {
        await db.query(`ANALYZE`);
      } else if (operation === "REINDEX") {
        await db.query(`REINDEX SCHEMA ${schemaTarget}`);
      }
    } catch (err) {
      logger.error("Maintenance operation failed", {
        operation,
        schemaTarget,
        err,
      });
      return {
        success: false,
        operation,
        startedAt,
        message: `Manutencao ${operation} falhou`,
      };
    }

    return {
      success: true,
      operation,
      startedAt,
      message: `Manutencao ${operation} executada com sucesso`,
    };
  }

  async getConnectionPool(): Promise<PoolStats> {
    let maxConnections = 0;
    let activeConnections = 0;
    let idleConnections = 0;
    let waitingConnections = 0;
    const connectionsByModule: Record<string, number> = {};

    try {
      const maxConnResult = await db.query<{ setting: string }>(
        "SELECT setting FROM pg_settings WHERE name = 'max_connections'",
      );
      if (maxConnResult.rows.length > 0) {
        maxConnections = parseInt(maxConnResult.rows[0].setting, 10);
      }
    } catch (err) {
      logger.warn("Could not query max_connections from pg_settings", { err });
    }

    try {
      const stateResult = await db.query<{
        state: string | null;
        count: string;
      }>(`
        SELECT state, COUNT(*) AS count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);
      for (const row of stateResult.rows) {
        const count = parseInt(row.count, 10);
        if (row.state === "active") activeConnections = count;
        else if (row.state === "idle") idleConnections = count;
        else if (row.state === null) waitingConnections += count;
      }
    } catch (err) {
      logger.warn("Could not query connection states from pg_stat_activity", {
        err,
      });
    }

    try {
      const appResult = await db.query<{
        application_name: string | null;
        count: string;
      }>(`
        SELECT application_name, COUNT(*) AS count
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND application_name IS NOT NULL
          AND application_name <> ''
        GROUP BY application_name
      `);
      for (const row of appResult.rows) {
        if (row.application_name) {
          connectionsByModule[row.application_name] = parseInt(row.count, 10);
        }
      }
    } catch (err) {
      logger.warn(
        "Could not query connections by application from pg_stat_activity",
        { err },
      );
    }

    return {
      maxConnections,
      activeConnections,
      idleConnections,
      waitingConnections,
      connectionsByModule,
    };
  }

  async createAuditLog(body: {
    clinicId: string;
    userId?: string;
    action?: string;
    actionType?: string;
    details?: unknown;
    ipAddress?: string;
  }) {
    const { clinicId, userId, action, actionType, details, ipAddress } = body;
    return this.auditRepo.createLog({
      clinic_id: clinicId,
      user_id: userId,
      action: action || "CREATE",
      action_type: actionType || "unknown",
      details: details || {},
      ip_address: ipAddress || "unknown",
    });
  }
}
