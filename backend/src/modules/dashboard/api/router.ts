import { clinicGuard } from "@/middleware/clinicGuard";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import { IDatabaseConnection } from "@/infrastructure/database/IDatabaseConnection";
import { DashboardController } from "../controllers/DashboardController";
import { cacheRoute } from "@/infrastructure/redis/cacheRoute";

export function createDashboardRouter(db?: IDatabaseConnection): Router {
  const router: Router = Router();

  const dashboardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests from this IP, please try again later.",
  });

  router.use(dashboardLimiter);
  router.use(clinicGuard);

  if (!db) {
    // Without a database connection, return a stub router
    router.get("/overview", (_req, res) => {
      res
        .status(503)
        .json({ error: "Dashboard module requires database connection" });
    });
    return router;
  }

  const controller = new DashboardController(db);

  /**
   * GET /api/dashboard
   * Rota raiz — retorna overview do dashboard
   */
  router.get(
    "/",
    cacheRoute(
      60,
      (req) => `cache:dashboard:root:${req.user?.clinicId ?? "unknown"}`,
    ),
    (req, res) => controller.getOverview(req, res),
  );

  /**
   * GET /api/dashboard/overview
   * Retorna dados consolidados do dashboard
   * Cache Redis de 60 segundos por clínica para reduzir carga no banco de dados
   */
  router.get(
    "/overview",
    cacheRoute(
      60,
      (req) => `cache:dashboard:overview:${req.user?.clinicId ?? "unknown"}`,
    ),
    (req, res) => controller.getOverview(req, res),
  );

  return router;
}
