import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { PdvController } from "./PdvController";
import { PDVController as PDVDashboardController } from "./controller";

export function createPdvRouter(): Router {
  const router: Router = Router();
  router.use(clinicGuard);
  const controller = new PdvController();
  const dashboardCtrl = new PDVDashboardController();

  // Sales CRUD
  router.post("/vendas", controller.createVenda);
  router.get("/vendas", controller.listVendas);
  router.get("/vendas/:id", controller.getVendaById);
  router.post("/vendas/:id/cancelar", controller.cancelVenda);

  // Stock alerts
  router.get("/estoque-alerta", controller.getEstoqueAlerta);

  // Dashboard & Gamification
  router.get("/dashboard-executivo", dashboardCtrl.getDashboardExecutivo);
  router.get("/metas-gamificacao", dashboardCtrl.getMetasGamificacao);

  return router;
}
