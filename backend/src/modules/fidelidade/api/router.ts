import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { FidelidadeController } from "./controller";

const controller = new FidelidadeController();
const router: Router = Router();
router.use(clinicGuard);

// Root route — module status
router.get("/", (req, res) => {
  res.json({
    module: "fidelidade",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list"
  });
});

// Pontos
router.get("/pontos", (req, res) => controller.getPoints(req, res));
router.post("/pontos", (req, res) => controller.addPoints(req, res));

// Badges
router.get("/badges", (req, res) => controller.listBadges(req, res));
router.post("/badges", (req, res) => controller.createBadge(req, res));

// Recompensas
router.get("/recompensas", (req, res) => controller.listRecompensas(req, res));
router.post("/recompensas", (req, res) => controller.createRecompensa(req, res));

// Indicações
router.get("/indicacoes", (req, res) => controller.listIndicacoes(req, res));
router.post("/indicacoes", (req, res) => controller.createIndicacao(req, res));

export default router;
