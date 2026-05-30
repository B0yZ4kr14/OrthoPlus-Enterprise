import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import { SplitPagamentoController } from "./controller";

const controller = new SplitPagamentoController();
const router: Router = Router();

const splitPagamentoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later.",
});

router.use(splitPagamentoLimiter);
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "split_pagamento",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list",
  });
});

// Config
router.get("/config", asyncHandler(controller.getConfig.bind(controller)));
router.put("/config", asyncHandler(controller.upsertConfig.bind(controller)));
router.post("/config", asyncHandler(controller.upsertConfig.bind(controller))); // alias for frontend compatibility

// Comissões
router.get(
  "/comissoes",
  asyncHandler(controller.listComissoes.bind(controller)),
);
router.post(
  "/comissoes",
  asyncHandler(controller.createComissao.bind(controller)),
);

// Transações
router.get(
  "/transacoes",
  asyncHandler(controller.listTransacoes.bind(controller)),
);

// Calculate split distribution
router.post(
  "/calculate",
  asyncHandler(controller.calculateSplit.bind(controller)),
);

export default router;
