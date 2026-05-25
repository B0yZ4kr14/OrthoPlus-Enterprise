import { clinicGuard } from "@/middleware/clinicGuard";
/**
 * MÓDULO INVENTÁRIO - Router
 */

import { Router } from 'express';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { ProdutoRepositoryPostgres } from '../infrastructure/repositories/ProdutoRepositoryPostgres';
import { dbRouter } from './dbRouter';
import { InventarioController } from './InventarioController';

export function createInventarioRouter(db?: IDatabaseConnection): Router {
  const router: Router = Router();
router.use(clinicGuard);

  const produtoRepository = db ? new ProdutoRepositoryPostgres(db) : undefined;
  const controller = new InventarioController(produtoRepository);

  // Rotas
  router.get('/', controller.listarProdutos);
  router.post('/produtos', controller.cadastrarProduto);
  router.get('/produtos', controller.listarProdutos);
  router.get('/produtos/:id', controller.obterProduto);
  router.patch('/produtos/:id', controller.atualizarProduto);
  router.delete('/produtos/:id', controller.removerProduto);

  // Automations / Legacy / Webhooks
  router.post("/automation", controller.manageAutomation);

  // Individual legacy fallback points for specific manual requests if unmigrated
  router.post("/gerar-pedidos-automaticos", (req, res, next) => {
    req.body.action = "gerar-pedidos-automaticos";
    controller.manageAutomation(req, res, next);
  });

  router.post("/prever-reposicao", (req, res, next) => {
    req.body.action = "prever-reposicao";
    controller.manageAutomation(req, res, next);
  });

  router.post("/send-stock-alerts", (req, res, next) => {
    req.body.action = "send-stock-alerts";
    controller.manageAutomation(req, res, next);
  });

  router.post("/processar-retry-pedidos", (req, res, next) => {
    req.body.action = "processar-retry-pedidos";
    controller.manageAutomation(req, res, next);
  });

  router.post("/enviar-pedido-automatico-api", (req, res, next) => {
    req.body.action = "enviar-pedido-automatico-api";
    controller.manageAutomation(req, res, next);
  });

  router.post("/webhook-confirmacao-pedido", (req, res, next) => {
    req.body.action = "webhook-confirmacao-pedido";
    controller.manageAutomation(req, res, next);
  });

  router.use('/db', dbRouter);

  return router;
}
