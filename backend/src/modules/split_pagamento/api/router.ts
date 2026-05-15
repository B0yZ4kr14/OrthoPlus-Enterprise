import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { SplitPagamentoController } from "./controller";

const controller = new SplitPagamentoController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "split_pagamento",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Config
router.get("/config", (_req, res) => controller.getConfig(_req, res));
router.put("/config", (_req, res) => controller.upsertConfig(_req, res));
router.post("/config", (_req, res) => controller.upsertConfig(_req, res));  // alias for frontend compatibility

// Comissões
router.get("/comissoes", (_req, res) => controller.listComissoes(_req, res));
router.post("/comissoes", (_req, res) => controller.createComissao(_req, res));

// Transações
router.get("/transacoes", (_req, res) => controller.listTransacoes(_req, res));

// Calculate split distribution
router.post("/calculate", (_req, res) => controller.calculateSplit(_req, res));

export default router;
