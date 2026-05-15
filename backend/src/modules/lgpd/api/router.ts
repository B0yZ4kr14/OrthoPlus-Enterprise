import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { LGPDController } from "./controller";

const controller = new LGPDController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "lgpd",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Consentimentos
router.get("/consentimentos", (_req, res) => controller.listConsentimentos(_req, res));
router.post("/consentimentos", (_req, res) => controller.createConsentimento(_req, res));

// Solicitações
router.get("/solicitacoes", (_req, res) => controller.listSolicitacoes(_req, res));
router.post("/solicitacoes", (_req, res) => controller.createSolicitacao(_req, res));
router.patch("/solicitacoes/:id", (_req, res) => controller.updateSolicitacao(_req, res));

export default router;
