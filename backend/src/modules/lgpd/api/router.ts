import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { LGPDController } from "./controller";

const controller = new LGPDController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (req, res) => {
  res.json({
    module: "lgpd",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Consentimentos
router.get("/consentimentos", (req, res) => controller.listConsentimentos(req, res));
router.post("/consentimentos", (req, res) => controller.createConsentimento(req, res));

// Solicitações
router.get("/solicitacoes", (req, res) => controller.listSolicitacoes(req, res));
router.post("/solicitacoes", (req, res) => controller.createSolicitacao(req, res));
router.patch("/solicitacoes/:id", (req, res) => controller.updateSolicitacao(req, res));

export default router;
