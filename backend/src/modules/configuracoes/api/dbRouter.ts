import { Router, Request, Response, NextFunction } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import { AdministrativoBackupService } from "@/modules/configuracoes/infrastructure/AdministrativoBackupService";
import { AdministrativoDatabaseManager } from "@/modules/configuracoes/infrastructure/AdministrativoDatabaseManager";

const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const role = (req as any).user?.role; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (role !== "ADMIN" && role !== "ROOT") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

const manager = new AdministrativoDatabaseManager();
const backup = new AdministrativoBackupService();

const dbRouter: Router = Router();

dbRouter.use(clinicGuard);

dbRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.json(await manager.getHealth());
  }),
);

dbRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    res.json(await manager.getStats());
  }),
);

dbRouter.post(
  "/backup",
  adminOnly,
  asyncHandler(async (_req, res) => {
    res.json(await backup.runBackup());
  }),
);

dbRouter.get(
  "/backups",
  asyncHandler(async (_req, res) => {
    res.json(await backup.listBackups());
  }),
);

dbRouter.post(
  "/maintenance",
  adminOnly,
  asyncHandler(async (_req, res) => {
    res.json(await manager.runMaintenance());
  }),
);

export { dbRouter };
