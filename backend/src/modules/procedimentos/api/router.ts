import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import { Router } from "express";
import { ProcedimentosController } from "./controller";

const controller = new ProcedimentosController();
const router: Router = Router();
router.use(clinicGuard);

router.get("/", asyncHandler(controller.listTemplates.bind(controller)));
router.get("/templates", asyncHandler(controller.listTemplates.bind(controller)));
router.get("/templates/:id", asyncHandler(controller.getTemplateById.bind(controller)));
router.post("/templates", asyncHandler(controller.createTemplate.bind(controller)));
router.patch("/templates/:id", asyncHandler(controller.updateTemplate.bind(controller)));
router.delete("/templates/:id", asyncHandler(controller.deleteTemplate.bind(controller)));

export default router;
