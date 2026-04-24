import { Router, Request, Response } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import { AdministrativoBackupService } from "@/modules/configuracoes/infrastructure/AdministrativoBackupService";
import { AdministrativoDatabaseManager } from "@/modules/configuracoes/infrastructure/AdministrativoDatabaseManager";

const manager = new AdministrativoDatabaseManager();
const backup = new AdministrativoBackupService();

const dbRouter: Router = Router();

dbRouter.use(clinicGuard);

dbRouter.get("/health", async (_req: Request, res: Response) => {
  try {
    res.json(await manager.getHealth());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

dbRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    res.json(await manager.getStats());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

dbRouter.post("/backup", async (_req: Request, res: Response) => {
  try {
    res.json(await backup.runBackup());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

dbRouter.get("/backups", async (_req: Request, res: Response) => {
  try {
    res.json(await backup.listBackups());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

dbRouter.post("/maintenance", async (_req: Request, res: Response) => {
  try {
    res.json(await manager.runMaintenance());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { dbRouter };
