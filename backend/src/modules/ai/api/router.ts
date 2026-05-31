import { Router, Request, Response } from "express";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { clinicGuard } from "../../../middleware/clinicGuard";
import { logger } from "@/infrastructure/logger";
import { triagemVirtual, TriagemSchema, healthCheckAI } from "../ai.service";

const router: Router = Router();

/**
 * GET /api/ai/health
 * Health check do módulo AI (público)
 */
router.get("/health", async (_req: Request, res: Response) => {
  const health = await healthCheckAI();
  res.json(health);
});

router.use(clinicGuard);

/**
 * POST /api/ai/triagem
 * Recebe sintomas e retorna especialidade sugerida e urgência
 */
router.post("/triagem", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = TriagemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Dados inválidos",
        details: parsed.error.format(),
      });
      return;
    }

    const result = await triagemVirtual(parsed.data);
    res.json(result);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[AI/Triagem] Erro:", err.message);
    res.status(500).json({
      error: "Erro ao processar triagem",
      message: err.message,
    });
  }
});

export default router;
