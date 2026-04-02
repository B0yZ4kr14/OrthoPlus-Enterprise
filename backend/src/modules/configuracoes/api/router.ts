import { Router } from "express";
import { ModulosController } from "./ModulosController";

export function createConfiguracoesRouter(): Router {
  const router = Router();
  const controller = new ModulosController();

  router.get("/modulos", controller.getMyModules);
  router.get("/modulos/dependencies", controller.getDependencies);
  router.post("/modulos/:id/toggle", controller.toggleModuleState);

  // Legacy Module Imports/Exports & Templates
  router.post("/apply-template", controller.applyModuleTemplate);
  router.post("/suggest", controller.suggestModules);
  router.post("/recommend-sequence", controller.recommendModuleSequence);
  router.post("/import-data", controller.importClinicData);
  router.get("/export-data", controller.exportClinicData);

  return router;
}
