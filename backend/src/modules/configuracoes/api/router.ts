import { clinicGuard } from "@/middleware/clinicGuard";
import { logger } from "@/infrastructure/logger";
import { Router, Request, Response } from "express";
import { ModulosController } from "./ModulosController";
import { IScheduledBackupRepository } from "../domain/repositories/IScheduledBackupRepository";
import { ScheduledBackupRepository } from "../infrastructure/ScheduledBackupRepository";

export function createConfiguracoesRouter(): Router {
  const router: Router = Router();
  const controller = new ModulosController();
  const backupRepo: IScheduledBackupRepository =
    new ScheduledBackupRepository();

  // Module catalog endpoints — hardcoded, no clinic context needed
  router.get("/modulos", controller.getMyModules);
  router.get("/modulos/dependencies", controller.getDependencies);

  // Clinic-scoped endpoints require clinicGuard
  router.use(clinicGuard);

  router.post("/modulos/toggle", controller.toggleModuleByKey);
  router.post("/modulos/:id/toggle", controller.toggleModuleState);

  // Legacy Module Imports/Exports & Templates
  router.post("/apply-template", controller.applyModuleTemplate);
  router.post("/suggest", controller.suggestModules);
  router.post("/recommend-sequence", controller.recommendModuleSequence);
  router.post("/import-data", controller.importClinicData);
  router.get("/export-data", controller.exportClinicData);

  // Scheduled Backups
  router.get("/backups/agendados", async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId)
        return res.status(401).json({ error: "Missing clinic context" });
      const data = await backupRepo.findMany(clinicId as string);
      return res.json(data);
    } catch (error) {
      logger.error("Error listing scheduled backups", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.patch(
    "/backups/agendados/:id",
    async (req: Request, res: Response) => {
      try {
        const clinicId = req.user?.clinicId;
        if (!clinicId)
          return res.status(401).json({ error: "Missing clinic context" });
        const data = await backupRepo.update(req.params.id, req.body);
        return res.json(data);
      } catch (error) {
        logger.error("Error updating scheduled backup", { error });
        return res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  router.delete(
    "/backups/agendados/:id",
    async (req: Request, res: Response) => {
      try {
        const clinicId = req.user?.clinicId;
        if (!clinicId)
          return res.status(401).json({ error: "Missing clinic context" });
        await backupRepo.delete(req.params.id);
        return res.status(204).send();
      } catch (error) {
        logger.error("Error deleting scheduled backup", { error });
        return res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  return router;
}
