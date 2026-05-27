import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import { Router } from "express";
import { TISSController } from "./controller";

const controller = new TISSController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "tiss",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Guias TISS
router.get("/guias", asyncHandler(controller.listGuias.bind(controller)));
router.get("/guias/:id", asyncHandler(controller.getGuiaById.bind(controller)));
router.post("/guias", asyncHandler(controller.createGuia.bind(controller)));
router.patch("/guias/:id", asyncHandler(controller.updateGuia.bind(controller)));
router.delete("/guias/:id", asyncHandler(controller.deleteGuia.bind(controller)));

// Lotes TISS
router.get("/lotes", asyncHandler(controller.listLotes.bind(controller)));
router.post("/lotes", asyncHandler(controller.createLote.bind(controller)));
router.patch("/lotes/:id", asyncHandler(controller.updateLote.bind(controller)));

// Batch submission — group guides and submit to insurance
router.post("/lotes/submit", asyncHandler(controller.submitBatch.bind(controller)));

// Statistics
router.get("/statistics", asyncHandler(controller.getStatistics.bind(controller)));

// Convênios
router.get("/convenios", asyncHandler(controller.listConvenios.bind(controller)));
router.post("/convenios", asyncHandler(controller.createConvenio.bind(controller)));
router.patch("/convenios/:id", asyncHandler(controller.updateConvenio.bind(controller)));
router.delete("/convenios/:id", asyncHandler(controller.deleteConvenio.bind(controller)));

export default router;
