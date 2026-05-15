import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { FidelidadeController } from "./controller";

const controller = new FidelidadeController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "fidelidade",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Pontos
router.get("/pontos", (_req, res) => controller.getPoints(_req, res));
router.post("/pontos", (_req, res) => controller.addPoints(_req, res));

// Badges
router.get("/badges", (_req, res) => controller.listBadges(_req, res));
router.post("/badges", (_req, res) => controller.createBadge(_req, res));

// Recompensas
router.get("/recompensas", (_req, res) => controller.listRecompensas(_req, res));
router.post("/recompensas", (_req, res) => controller.createRecompensa(_req, res));

// Indicações
router.get("/indicacoes", (_req, res) => controller.listIndicacoes(_req, res));
router.post("/indicacoes", (_req, res) => controller.createIndicacao(_req, res));

export default router;
