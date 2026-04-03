/**
 * Crypto Config Module Router
 */

import { Router } from "express";
import { CryptoConfigController } from "./CryptoConfigController";
import { CryptoController } from "./CryptoController";

import { VolatilityWorkerController } from "./volatilityWorker";

export function createCryptoConfigRouter(): Router {
  const router: Router = Router();
  const controller = new CryptoConfigController();
  const volatilityWorker = new VolatilityWorkerController();

  router.get("/exchanges", (req, res) => controller.listExchanges(req, res));
  router.post("/exchanges", (req, res) => controller.createExchange(req, res));
  router.get("/portfolio", (req, res) => controller.getPortfolio(req, res));
  router.get("/dca-strategies", (req, res) =>
    controller.getDCAStrategies(req, res),
  );

  // Phase 1: Ported from Edge Functions
  router.post("/offline-wallet/manage", (req, res) =>
    controller.manageOfflineWallet(req, res),
  );
  router.post("/offline-wallet/sync", (req, res) =>
    controller.syncCryptoWallet(req, res),
  );
  router.post("/offline-wallet/validate-xpub", (req, res) =>
    controller.validateXpub(req, res),
  );
  router.get("/realtime-notifications", (req, res) =>
    controller.realtimeNotify(req, res),
  );

  // Phase 2: Workers
  router.post("/workers/volatility", (req, res) =>
    volatilityWorker.processVolatilityAlerts(req, res),
  );

  // Phase 5: Webhooks
  router.post("/webhooks/transaction", (req, res) =>
    controller.webhookCryptoTransaction(req, res),
  );

  return router;
}

export function createCryptoRouter(): Router {
  const router: Router = Router();
  const controller = new CryptoController();

  router.post("/convert", controller.convertCryptoToBrl);
  router.post("/invoice", controller.createCryptoInvoice);
  router.get("/manager/status", controller.getCryptoManagerStatus);
  router.get("/rates", controller.getCryptoRates);
  router.post("/wallet/sync", controller.syncCryptoWallet);
  router.post("/wallet/validate-xpub", controller.validateXpub);
  router.post("/webhook", controller.handleCryptoWebhook);
  router.post("/wallet/offline", controller.manageOfflineWallet);
  router.post("/jobs/execute", controller.runCryptoJobs);

  return router;
}
