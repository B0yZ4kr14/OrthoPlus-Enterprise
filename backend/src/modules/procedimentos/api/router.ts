import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { ProcedimentosController } from "./controller";

const controller = new ProcedimentosController();
const router: Router = Router();
router.use(clinicGuard);

router.get("/templates", (req, res) => controller.listTemplates(req, res));
router.get("/templates/:id", (req, res) => controller.getTemplateById(req, res));
router.post("/templates", (req, res) => controller.createTemplate(req, res));
router.patch("/templates/:id", (req, res) => controller.updateTemplate(req, res));
router.delete("/templates/:id", (req, res) => controller.deleteTemplate(req, res));

export default router;
