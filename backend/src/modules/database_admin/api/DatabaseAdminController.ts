import { logger } from '@/infrastructure/logger';
/**
 * DatabaseAdminController
 * API para administração e monitoramento do banco de dados
 */

import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/infrastructure/database/prismaClient";
import { db } from "@/infrastructure/database/connection";
import { DatabaseHealth } from "../domain/entities/DatabaseHealth";

export class DatabaseAdminController {
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Query active/idle connections from pg_stat_activity
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
          "SELECT setting FROM pg_settings WHERE name = 'max_connections'"
        );
        if (maxConnResult.rows.length > 0) {
          connectionPoolSize = parseInt(maxConnResult.rows[0].setting, 10);
        }
      } catch (err) {
        logger.warn("Could not query pg_stat_activity for health", { err });
      }

      // Query slow queries count
      let slowQueriesCount = 0;
      try {
        const sqResult = await db.query<{ count: string }>(`
          SELECT COUNT(*) AS count FROM database_admin.slow_queries
          WHERE clinic_id = $1
        `, [clinicId]);
        slowQueriesCount = parseInt(sqResult.rows[0]?.count ?? "0", 10);
      } catch (err) {
        logger.warn("Could not query slow_queries count for health", { err });
      }

      // Query average query time and last vacuum/analyze from pg_stat_user_tables
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

      // Query average execution time from slow_queries
      try {
        const avgResult = await db.query<{ avg_time: string | null }>(`
          SELECT AVG(execution_time_ms) AS avg_time
          FROM database_admin.slow_queries
          WHERE clinic_id = $1
        `, [clinicId]);
        const raw = avgResult.rows[0]?.avg_time;
        if (raw !== null && raw !== undefined) {
          averageQueryTime = parseFloat(raw);
        }
      } catch (err) {
        logger.warn("Could not query avg execution time from slow_queries", { err });
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

      res.json({
        health: health.toJSON(),
        isHealthy: health.isHealthy(),
        needsMaintenance: health.needsMaintenance(),
      });
    } catch (error) {
      logger.error("Error getting database health:", { error });
      res.status(500).json({ error: "Erro ao obter saúde do banco" });
    }
  }

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      const { user_id, action, from, to } = req.query;

      const where: Record<string, any> = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any

      if (user_id && user_id !== "all") {
        where.user_id = String(user_id);
      }

      if (action && action !== "all") {
        where.action = String(action);
      }

      if (from || to) {
        where.created_at = {};
        if (from) {
          (where.created_at as Record<string, Date>).gte = new Date(String(from));
        }
        if (to) {
          const endDate = new Date(String(to));
          endDate.setHours(23, 59, 59, 999);
          (where.created_at as Record<string, Date>).lte = endDate;
        }
      }

      const logs = await prisma.audit_logs.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: 100,
      });

      const userIds = [
        ...new Set(logs.map((l) => l.user_id).filter(Boolean)),
      ] as string[];

      const profiles = await prisma.profiles.findMany({
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

      const result = logs.map((l) => ({
        ...l,
        profiles: l.user_id
          ? { full_name: profilesMap[l.user_id] || "Desconhecido" }
          : null,
      }));

      res.json(result);
    } catch (error) {
      logger.error("Error getting audit logs:", { error });
      res.status(500).json({ error: "Erro ao obter logs de auditoria" });
    }
  }

  async getSlowQueries(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      let slowQueries: {
        query: string;
        calls: number;
        averageTime: number;
        totalTime: number;
        lastExecuted: Date;
      }[] = [];

      try {
        const result = await db.query<{
          query_text: string;
          calls: number;
          execution_time_ms: number;
          recorded_at: Date;
        }>(`
          SELECT query_text, calls, execution_time_ms, recorded_at
          FROM database_admin.slow_queries
          WHERE clinic_id = $1
          ORDER BY execution_time_ms DESC
          LIMIT 50
        `, [clinicId]);

        if (result.rows.length > 0) {
          slowQueries = result.rows.map((row) => ({
            query: row.query_text,
            calls: Number(row.calls),
            averageTime: Number(row.execution_time_ms),
            totalTime: Number(row.execution_time_ms) * Number(row.calls),
            lastExecuted: new Date(row.recorded_at),
          }));
        } else {
          // Fallback: try pg_stat_statements if available
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
            // pg_stat_statements not available, return empty
          }
        }
      } catch (err) {
        logger.warn("Could not query slow_queries table", { err });
      }

      res.json({ slowQueries });
    } catch (error) {
      logger.error("Error getting slow queries:", { error });
      res.status(500).json({ error: "Erro ao obter queries lentas" });
    }
  }

  async runMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const schema = z.object({
        operation: z.enum(["VACUUM", "ANALYZE", "REINDEX", "VACUUM_FULL"]),
        targetSchema: z.string().optional(),
      });

      const { operation, targetSchema } = schema.parse(req.body);
      const clinicId = req.user?.clinicId;

      if (!clinicId || req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Acesso negado" });
        return;
      }

      const startedAt = new Date();

      // Execute the real maintenance command on the current database
      const schemaTarget = targetSchema ?? "public";

      // Validate schemaTarget to prevent SQL injection (only allow valid identifier characters)
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaTarget)) {
        res.status(400).json({ error: "Nome de schema inválido" });
        return;
      }

      try {
        if (operation === "VACUUM") {
          await db.query(`VACUUM ANALYZE`);
        } else if (operation === "VACUUM_FULL") {
          await db.query(`VACUUM FULL ANALYZE`);
        } else if (operation === "ANALYZE") {
          await db.query(`ANALYZE`);
        } else if (operation === "REINDEX") {
          // REINDEX DATABASE requires the database name; use REINDEX SCHEMA as a safe alternative.
          // schemaTarget is validated above to contain only safe identifier characters.
          await db.query(`REINDEX SCHEMA ${schemaTarget}`);
        }
      } catch (err) {
        logger.error("Maintenance operation failed", { operation, schemaTarget, err });
        res.status(500).json({
          success: false,
          operation,
          startedAt,
          message: `Manutenção ${operation} falhou`,
        });
        return;
      }

      res.json({
        success: true,
        operation,
        startedAt,
        message: `Manutenção ${operation} executada com sucesso`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: "Dados inválidos", details: error.errors });
        return;
      }
      logger.error("Error running maintenance:", { error });
      res.status(500).json({ error: "Erro ao executar manutenção" });
    }
  }

  async getConnectionPool(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      let maxConnections = 0;
      let activeConnections = 0;
      let idleConnections = 0;
      let waitingConnections = 0;
      const connectionsByModule: Record<string, number> = {};

      try {
        const maxConnResult = await db.query<{ setting: string }>(
          "SELECT setting FROM pg_settings WHERE name = 'max_connections'"
        );
        if (maxConnResult.rows.length > 0) {
          maxConnections = parseInt(maxConnResult.rows[0].setting, 10);
        }
      } catch (err) {
        logger.warn("Could not query max_connections from pg_settings", { err });
      }

      try {
        const stateResult = await db.query<{ state: string | null; count: string }>(`
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
        logger.warn("Could not query connection states from pg_stat_activity", { err });
      }

      try {
        const appResult = await db.query<{ application_name: string | null; count: string }>(`
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
        logger.warn("Could not query connections by application from pg_stat_activity", { err });
      }

      const poolStats = {
        maxConnections,
        activeConnections,
        idleConnections,
        waitingConnections,
        connectionsByModule,
      };

      res.json({ poolStats });
    } catch (error) {
      logger.error("Error getting connection pool:", { error });
      res.status(500).json({ error: "Erro ao obter pool de conexões" });
    }
  }
}
