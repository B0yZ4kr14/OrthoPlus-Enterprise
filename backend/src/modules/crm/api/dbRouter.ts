import { Router, Request, Response, NextFunction } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import type { Router as ExpressRouter } from "express";
import { ComercialBackupService } from "../infrastructure/ComercialBackupService";
import { ComercialDatabaseManager } from "../infrastructure/ComercialDatabaseManager";

const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const role = (req as any).user?.role; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (role !== "ADMIN" && role !== "ROOT") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

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

dbRouter.post("/backup", adminOnly, async (_req, res) => {
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

dbRouter.post("/maintenance", adminOnly, async (_req, res) => {
  try {
    res.json(await manager.runMaintenance());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { dbRouter };
