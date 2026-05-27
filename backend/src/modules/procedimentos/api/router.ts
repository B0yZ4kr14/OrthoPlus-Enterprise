import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import { Router } from "express";
import { ProcedimentosController } from "./controller";

const controller = new ProcedimentosController();
const router: Router = Router();
router.use(clinicGuard);

// Templates
router.get("/", asyncHandler(controller.listTemplates.bind(controller)));
router.get("/templates", asyncHandler(controller.listTemplates.bind(controller)));
router.get("/templates/:id", asyncHandler(controller.getTemplateById.bind(controller)));
router.post("/templates", asyncHandler(controller.createTemplate.bind(controller)));
router.patch("/templates/:id", asyncHandler(controller.updateTemplate.bind(controller)));
router.delete("/templates/:id", asyncHandler(controller.deleteTemplate.bind(controller)));

// Tabelas de preços
router.get("/tabelas", asyncHandler(controller.listTabelas.bind(controller)));
router.get("/tabelas/:id", asyncHandler(controller.getTabelaById.bind(controller)));
router.post("/tabelas", asyncHandler(controller.createTabela.bind(controller)));
router.patch("/tabelas/:id", asyncHandler(controller.updateTabela.bind(controller)));
router.delete("/tabelas/:id", asyncHandler(controller.deleteTabela.bind(controller)));

// Preços por procedimento
router.get("/precos", asyncHandler(controller.listPrecos.bind(controller)));
router.post("/precos", asyncHandler(controller.createPreco.bind(controller)));
router.patch("/precos/:id", asyncHandler(controller.updatePreco.bind(controller)));
router.delete("/precos/:id", asyncHandler(controller.deletePreco.bind(controller)));
router.post("/precos/reajuste", asyncHandler(controller.reajustarPrecos.bind(controller)));

// Associação dentista-procedimento
router.get("/dentista-procedimentos", asyncHandler(controller.listDentistaProcs.bind(controller)));
router.post("/dentista-procedimentos", asyncHandler(controller.createDentistaProc.bind(controller)));
router.patch("/dentista-procedimentos/:id", asyncHandler(controller.updateDentistaProc.bind(controller)));
router.delete("/dentista-procedimentos/:id", asyncHandler(controller.deleteDentistaProc.bind(controller)));

export default router;
