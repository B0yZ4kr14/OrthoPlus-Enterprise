import { Router } from "express";
import rateLimit from "express-rate-limit";
import { clinicGuard } from "@/middleware/clinicGuard";
import { BIController } from "./controller";

const controller = new BIController();
const router: Router = Router();

const biLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiter before clinic context validation
router.use(biLimiter);

// Apply clinic context validation to all routes in this module
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "bi",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list",
  });
});

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
