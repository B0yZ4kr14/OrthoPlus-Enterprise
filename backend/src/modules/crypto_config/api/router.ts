import { clinicGuard } from "@/middleware/clinicGuard";
/**
 * Crypto Config Module Router
 */

import { Router } from "express";
import { CryptoConfigController } from "./CryptoConfigController";
import { CryptoController } from "./CryptoController";

import { VolatilityWorkerController } from "./volatilityWorker";

export function createCryptoConfigRouter(): Router {
  const router: Router = Router();
  router.use(clinicGuard);
  const controller = new CryptoConfigController();
  const volatilityWorker = new VolatilityWorkerController();

  router.get("/exchanges", controller.listExchanges);
  router.post("/exchanges", controller.createExchange);
  router.get("/portfolio", controller.getPortfolio);
  router.get("/dca-strategies", controller.getDCAStrategies);

  // Phase 1: Ported from Edge Functions
  router.post("/offline-wallet/manage", controller.manageOfflineWallet);
  router.post("/offline-wallet/sync", controller.syncCryptoWallet);
  router.post("/offline-wallet/validate-xpub", controller.validateXpub);
  router.get("/realtime-notifications", controller.realtimeNotify);

  // Phase 2: Workers
  router.post("/workers/volatility", (req, res) =>
    volatilityWorker.processVolatilityAlerts(req, res),
  );

  // Phase 5: Webhooks
  router.post("/webhooks/transaction", controller.webhookCryptoTransaction);

  // Payment address generation (Wave-2 fix)
  router.post("/payment-address", controller.generatePaymentAddress);

  return router;
}

export function createCryptoRouter(): Router {
  const router: Router = Router();
  router.use(clinicGuard);
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
