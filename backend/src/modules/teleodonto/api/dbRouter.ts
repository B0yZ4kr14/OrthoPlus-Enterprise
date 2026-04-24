import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { ClinicoBackupService } from "../infrastructure/ClinicoBackupService";
import { ClinicoDatabaseManager } from "../infrastructure/ClinicoDatabaseManager";

const manager = new ClinicoDatabaseManager();
const backup = new ClinicoBackupService();
const dbRouter: Router = Router();

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
