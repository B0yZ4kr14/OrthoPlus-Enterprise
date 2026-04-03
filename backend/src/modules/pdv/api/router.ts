import { Router } from 'express';
import { PdvController } from './PdvController';
import { PDVController as PDVDashboardController } from './controller';

export function createPdvRouter(): Router {
  const router: Router = Router();
  const controller = new PdvController();
  const dashboardCtrl = new PDVDashboardController();

  // Sales CRUD
  router.post('/vendas', (req, res) => controller.createVenda(req, res));
  router.get('/vendas', (req, res) => controller.listVendas(req, res));
  router.get('/vendas/:id', (req, res) => controller.getVendaById(req, res));
  router.post('/vendas/:id/cancelar', (req, res) => controller.cancelVenda(req, res));

  // Dashboard & Gamification
  router.get('/dashboard-executivo', (req, res) => dashboardCtrl.getDashboardExecutivo(req, res));
  router.get('/metas-gamificacao', (req, res) => dashboardCtrl.getMetasGamificacao(req, res));

  return router;
}
