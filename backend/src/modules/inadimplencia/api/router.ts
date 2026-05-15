import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { InadimplenciaController } from "./controller";

const controller = new InadimplenciaController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "inadimplencia",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Inadimplentes
router.get("/inadimplentes", (_req, res) => controller.listInadimplentes(_req, res));
router.get("/inadimplentes/:id", (_req, res) => controller.getInadimplente(_req, res));
router.patch("/inadimplentes/:id", (_req, res) => controller.updateInadimplente(_req, res));

// Campanhas de cobrança
router.get("/campanhas", (_req, res) => controller.listCampanhasCobranca(_req, res));
router.post("/campanhas", (_req, res) => controller.createCampanhaCobranca(_req, res));
router.patch("/campanhas/:id", (_req, res) => controller.updateCampanhaCobranca(_req, res));

export default router;
