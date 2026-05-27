import { clinicGuard } from "@/middleware/clinicGuard";
import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Router, Request, Response } from "express";
import { dbRouter } from "./dbRouter";
import { ModulosController } from "./ModulosController";

export function createConfiguracoesRouter(): Router {
  const router: Router = Router();
  const controller = new ModulosController();

  router.use("/db", dbRouter);

  // Module catalog endpoints — hardcoded, no clinic context needed
  router.get("/modulos", controller.getMyModules);
  router.get("/modulos/dependencies", controller.getDependencies);
  // by-key toggle (frontend sends { module_key } in body — must be before /:id/toggle)
  router.post("/modulos/toggle", controller.toggleModuleByKey);
  router.post("/modulos/:id/toggle", controller.toggleModuleState);

  // Legacy Module Imports/Exports & Templates
  router.post("/apply-template", controller.applyModuleTemplate);
  router.post("/suggest", controller.suggestModules);
  router.post("/recommend-sequence", controller.recommendModuleSequence);
  router.post("/import-data", controller.importClinicData);

  // Clinic-scoped endpoints require clinicGuard
  router.use(clinicGuard);
  router.get("/export-data", controller.exportClinicData);

  // Scheduled Backups (Wave-2 fix: previously missing endpoints)
  router.get("/backups/agendados", async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: "Missing clinic context" });
      const data = await prisma.scheduled_backups.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { clinic_id: clinicId },
        orderBy: { created_at: "desc" },
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error listing scheduled backups", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.patch("/backups/agendados/:id", async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: "Missing clinic context" });
      const data = await prisma.scheduled_backups.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: req.body,
      });
      return res.json(data);
    } catch (error) {
      logger.error("Error updating scheduled backup", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.delete("/backups/agendados/:id", async (req: Request, res: Response) => {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) return res.status(401).json({ error: "Missing clinic context" });
      await prisma.scheduled_backups.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(204).send();
    } catch (error) {
      logger.error("Error deleting scheduled backup", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
