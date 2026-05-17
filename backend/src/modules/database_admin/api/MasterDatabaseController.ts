/**
 * MasterDatabaseController
 * API para gerenciamento federado de categorias de banco de dados
 */

import { Request, Response } from "express";
import { z } from "zod";
import { logger } from "@/infrastructure/logger";
import { MasterDatabaseManager } from "../infrastructure/MasterDatabaseManager";
import { circuitBreakerRegistry } from "@/infrastructure/database/CategoryCircuitBreaker";
import { BackupSchedulerService } from "../infrastructure/BackupSchedulerService";

const masterManager = new MasterDatabaseManager();
const backupService = new BackupSchedulerService();

export class MasterDatabaseController {
  // ─── Categories ───

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }
      const categories = masterManager.getCategories();
      res.json({ categories });
    } catch (error) {
      logger.error("Error getting categories", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ─── Health & Stats ───

  async getMasterHealth(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }
      const health = await masterManager.getHealth();
      res.json(health);
    } catch (error) {
      logger.error("Error getting master health", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getMasterStats(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }
      const stats = await masterManager.getStats();
      res.json(stats);
    } catch (error) {
      logger.error("Error getting master stats", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ─── Cross Query ───

  async crossQuery(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      const schema = z.object({
        query: z.string().min(1),
        schemas: z.array(z.string()).min(1),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const result = await masterManager.crossQuery(
        parsed.data.query,
        parsed.data.schemas
      );
      res.json(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      logger.error("Error running cross-query", { error });
      res.status(400).json({ error: msg });
    }
  }

  // ─── Circuit Breaker ───

  async getCircuitMetrics(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }
      const metrics = circuitBreakerRegistry.getAllMetrics();
      res.json({ metrics });
    } catch (error) {
      logger.error("Error getting circuit metrics", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async resetCircuit(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      const { category } = req.params;
      if (category) {
        circuitBreakerRegistry.resetCategory(category);
        res.json({ message: `Circuit breaker reset for ${category}` });
      } else {
        circuitBreakerRegistry.resetAll();
        res.json({ message: "All circuit breakers reset" });
      }
    } catch (error) {
      logger.error("Error resetting circuit breaker", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ─── Backup Scheduler ───

  async getBackupStatus(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }
      const status = await backupService.getAllBackupStatus();
      res.json({ categories: status });
    } catch (error) {
      logger.error("Error getting backup status", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async executeBackup(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      const { category } = req.params;
      const { compress } = req.body;
      const result = await backupService.executeBackup(category, { compress });
      res.json(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      logger.error("Error executing backup", { error });
      res.status(400).json({ error: msg });
    }
  }
}
