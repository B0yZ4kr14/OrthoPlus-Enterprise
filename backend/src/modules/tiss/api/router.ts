import { clinicGuard } from "@/middleware/clinicGuard";
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
router.get("/guias", (_req, res) => controller.listGuias(_req, res));
router.get("/guias/:id", (_req, res) => controller.getGuiaById(_req, res));
router.post("/guias", (_req, res) => controller.createGuia(_req, res));
router.patch("/guias/:id", (_req, res) => controller.updateGuia(_req, res));
router.delete("/guias/:id", (_req, res) => controller.deleteGuia(_req, res));

// Lotes TISS
router.get("/lotes", (_req, res) => controller.listLotes(_req, res));
router.post("/lotes", (_req, res) => controller.createLote(_req, res));
router.patch("/lotes/:id", (_req, res) => controller.updateLote(_req, res));

// Batch submission — group guides and submit to insurance
router.post("/lotes/submit", (_req, res) => controller.submitBatch(_req, res));

// Statistics
router.get("/statistics", (_req, res) => controller.getStatistics(_req, res));

export default router;
