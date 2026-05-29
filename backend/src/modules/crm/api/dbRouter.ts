import { Router, Request, Response, NextFunction } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
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
