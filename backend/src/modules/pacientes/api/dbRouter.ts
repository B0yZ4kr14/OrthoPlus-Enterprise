import { Router } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import { CoreDatabaseManager } from "../infrastructure/CoreDatabaseManager";
import { CoreBackupService } from "../infrastructure/CoreBackupService";

const manager = new CoreDatabaseManager();
const backup = new CoreBackupService();

const dbRouter: Router = Router();

dbRouter.use(clinicGuard);

dbRouter.get("/health", async (req, res) => {
  try {
    res.json(await manager.getHealth());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.get("/stats", async (req, res) => {
  try {
    res.json(await manager.getStats());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.post("/backup", async (req, res) => {
  try {
    res.json(await backup.runBackup());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.get("/backups", async (req, res) => {
  try {
    res.json(await backup.listBackups());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

dbRouter.post("/maintenance", async (req, res) => {
  try {
    res.json(await manager.runMaintenance());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { dbRouter };
