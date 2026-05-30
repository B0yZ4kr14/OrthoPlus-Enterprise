import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import { FidelidadeController } from "./controller";

const controller = new FidelidadeController();
const router: Router = Router();

const fidelidadeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later.",
});

router.use(fidelidadeLimiter);
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "fidelidade",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list",
  });
});

// Pontos
router.get("/pontos", asyncHandler(controller.getPoints.bind(controller)));
router.post("/pontos", asyncHandler(controller.addPoints.bind(controller)));

// Badges
router.get("/badges", asyncHandler(controller.listBadges.bind(controller)));
router.post("/badges", asyncHandler(controller.createBadge.bind(controller)));

// Recompensas
router.get(
  "/recompensas",
  asyncHandler(controller.listRecompensas.bind(controller)),
);
router.post(
  "/recompensas",
  asyncHandler(controller.createRecompensa.bind(controller)),
);

// Indicações
router.get(
  "/indicacoes",
  asyncHandler(controller.listIndicacoes.bind(controller)),
);
router.post(
  "/indicacoes",
  asyncHandler(controller.createIndicacao.bind(controller)),
);

export default router;
