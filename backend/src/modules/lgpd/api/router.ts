import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
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
router.get("/consentimentos", asyncHandler(controller.listConsentimentos.bind(controller)));
router.post("/consentimentos", asyncHandler(controller.createConsentimento.bind(controller)));

// Solicitações
router.get("/solicitacoes", asyncHandler(controller.listSolicitacoes.bind(controller)));
router.post("/solicitacoes", asyncHandler(controller.createSolicitacao.bind(controller)));
router.patch("/solicitacoes/:id", asyncHandler(controller.updateSolicitacao.bind(controller)));

export default router;
