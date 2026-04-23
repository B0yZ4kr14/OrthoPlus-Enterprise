import { Router } from "express";
import { BIController } from "./controller";

const controller = new BIController();
const router: Router = Router();

// Dashboards
router.get("/dashboards", controller.listDashboards);
router.get("/dashboards/:id", controller.getDashboardById);
router.post("/dashboards", controller.createDashboard);
router.patch("/dashboards/:id", controller.updateDashboard);

// Metricas
router.get("/metricas", controller.getMetricas);

// Widgets (nested under dashboards)
router.get("/dashboards/:dashboard_id/widgets", controller.listWidgets);
router.post("/dashboards/:dashboard_id/widgets", controller.createWidget);
router.patch("/widgets/:id", controller.updateWidget);
router.delete("/widgets/:id", controller.deleteWidget);

export default router;
