import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { AnalyticsController } from "./analyticsController";
import { cacheRoute } from "@/infrastructure/redis/cacheRoute";

const router: Router = Router();
router.use(clinicGuard);
const controller = new AnalyticsController();

// Relatórios consolidados
router.get(
  "/dashboard-overview",
  cacheRoute(300),
  controller.getDashboardOverview.bind(controller),
);
router.get(
  "/unified-metrics",
  cacheRoute(300),
  controller.getUnifiedMetrics.bind(controller),
);
router.get(
  "/marketing-roi",
  cacheRoute(300),
  controller.getMarketingROI.bind(controller),
);

// Ponto unificado de processamento de analises e background events
router.post("/processor", controller.processAnalytics.bind(controller));

// Sidebar notification badges
router.get("/sidebar-badges", controller.getSidebarBadges.bind(controller));

export default router;
