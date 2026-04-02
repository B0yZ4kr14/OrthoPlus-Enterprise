/**
 * MÓDULO INVENTÁRIO - Router
 */

import { Router } from 'express';
import { IDatabaseConnection } from '@/infrastructure/database/IDatabaseConnection';
import { ProdutoRepositoryPostgres } from '../infrastructure/repositories/ProdutoRepositoryPostgres';
import { InventarioController } from './InventarioController';

export function createInventarioRouter(db?: IDatabaseConnection): Router {
  const router = Router();

  const produtoRepository = db ? new ProdutoRepositoryPostgres(db) : undefined;
  const controller = new InventarioController(produtoRepository);

  // Rotas
  router.post('/produtos', controller.cadastrarProduto);
  router.get('/produtos', controller.listarProdutos);
  router.get('/produtos/:id', controller.obterProduto);

  // Automations / Legacy / Webhooks
  router.post("/automation", controller.manageAutomation);

  // Individual legacy fallback points for specific manual requests if unmigrated
  router.post("/gerar-pedidos-automaticos", (req, res) => {
    req.body.action = "gerar-pedidos-automaticos";
    controller.manageAutomation(req, res);
  });

  router.post("/prever-reposicao", (req, res) => {
    req.body.action = "prever-reposicao";
    controller.manageAutomation(req, res);
  });

  router.post("/send-stock-alerts", (req, res) => {
    req.body.action = "send-stock-alerts";
    controller.manageAutomation(req, res);
  });

  router.post("/processar-retry-pedidos", (req, res) => {
    req.body.action = "processar-retry-pedidos";
    controller.manageAutomation(req, res);
  });

  router.post("/enviar-pedido-automatico-api", (req, res) => {
    req.body.action = "enviar-pedido-automatico-api";
    controller.manageAutomation(req, res);
  });

  router.post("/webhook-confirmacao-pedido", (req, res) => {
    req.body.action = "webhook-confirmacao-pedido";
    controller.manageAutomation(req, res);
  });

  return router;
}
