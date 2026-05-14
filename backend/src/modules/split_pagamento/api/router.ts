import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { SplitPagamentoController } from "./controller";

const controller = new SplitPagamentoController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (req, res) => {
  res.json({
    module: "split_pagamento",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Config
router.get("/config", (req, res) => controller.getConfig(req, res));
router.put("/config", (req, res) => controller.upsertConfig(req, res));
router.post("/config", (req, res) => controller.upsertConfig(req, res));  // alias for frontend compatibility

// Comissões
router.get("/comissoes", (req, res) => controller.listComissoes(req, res));
router.post("/comissoes", (req, res) => controller.createComissao(req, res));

// Transações
router.get("/transacoes", (req, res) => controller.listTransacoes(req, res));

// Calculate split distribution
router.post("/calculate", (req, res) => controller.calculateSplit(req, res));

export default router;
