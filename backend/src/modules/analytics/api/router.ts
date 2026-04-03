import { Router } from "express";
import { AnalyticsController } from "./analyticsController";
import { cacheRoute } from "@/infrastructure/redis/cacheRoute";

const router: Router = Router();
const controller = new AnalyticsController();

// Relatórios consolidados
router.get(
  "/dashboard-overview",
  cacheRoute(300),
  controller.getDashboardOverview.bind(controller),
);
router.get("/unified-metrics", cacheRoute(300), controller.getUnifiedMetrics.bind(controller));
router.get("/marketing-roi", cacheRoute(300), controller.getMarketingROI.bind(controller));

// Ponto unificado de processamento de analises e background events
router.post("/processor", controller.processAnalytics.bind(controller));

export default router;
