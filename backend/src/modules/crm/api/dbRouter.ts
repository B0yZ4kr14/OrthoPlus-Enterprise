import { Router } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import type { Router as ExpressRouter } from "express";
import { ComercialBackupService } from "../infrastructure/ComercialBackupService";
import { ComercialDatabaseManager } from "../infrastructure/ComercialDatabaseManager";

const manager = new ComercialDatabaseManager();
const backup = new ComercialBackupService();
const dbRouter: ExpressRouter = Router();

dbRouter.use(clinicGuard);

dbRouter.get("/health", async (_req, res) => {
  try {
    res.json(await manager.getHealth());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.get("/stats", async (_req, res) => {
  try {
    res.json(await manager.getStats());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.post("/backup", async (_req, res) => {
  try {
    res.json(await backup.runBackup());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.get("/backups", async (_req, res) => {
  try {
    res.json(await backup.listBackups());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.post("/maintenance", async (_req, res) => {
  try {
    res.json(await manager.runMaintenance());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { dbRouter };
