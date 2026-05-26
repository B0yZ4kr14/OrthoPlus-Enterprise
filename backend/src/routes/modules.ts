import { Router } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import {
  applyModuleTemplate,
  getMyModules,
  suggestModules,
  toggleModuleState,
  recommendModuleSequence,
  importClinicData,
  exportClinicData,
  requestNewModule
} from "../controllers/moduleController";

const modulesRouter: Router = Router();

// Protect all /api/modules/* routes with clinic context validation
modulesRouter.use(clinicGuard);

// Module Management Routes
modulesRouter.post("/apply-template", asyncHandler(applyModuleTemplate));
modulesRouter.get("/my-modules", asyncHandler(getMyModules));
modulesRouter.post("/suggest", asyncHandler(suggestModules));
modulesRouter.post("/toggle", asyncHandler(toggleModuleState));
modulesRouter.post("/recommend-sequence", asyncHandler(recommendModuleSequence));

// Data Import/Export Routes
modulesRouter.post("/import-data", asyncHandler(importClinicData));
modulesRouter.get("/export-data", asyncHandler(exportClinicData));

// Module Request Route
modulesRouter.post("/request-new-module", asyncHandler(requestNewModule));

export default modulesRouter;
