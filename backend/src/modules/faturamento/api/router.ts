import { Router } from "express";
import { FaturamentoController } from "./FaturamentoController";
import { GamificationWorkerController } from "./gamificationWorker";

export function createFaturamentoRouter(): Router {
  const router = Router();
  const controller = new FaturamentoController();

  router.post("/nfes", (req, res) => controller.createNFe(req, res));
  router.get("/nfes", (req, res) => controller.listNFes(req, res));
  router.post("/nfes/:id/autorizar", (req, res) =>
    controller.autorizarNFe(req, res),
  );
  router.post("/nfes/:id/cancelar", (req, res) =>
    controller.cancelarNFe(req, res),
  );

  // Gamification Worker
  const gamificationWorker = new GamificationWorkerController();
  router.post("/gamification/process", (req, res) =>
    gamificationWorker.processGoalsAndRankings(req, res),
  );

  // Legacy Fiscal Routes
  router.post("/nfce/autorizar", (req, res) => controller.autorizarNfceSefaz(req, res));
  router.post("/nfce/carta-correcao", (req, res) => controller.cartaCorrecaoNfce(req, res));
  router.post("/nfce/emitir", (req, res) => controller.emitirNfce(req, res));
  router.post("/nfce/inutilizar", (req, res) => controller.inutilizarNumeracaoNfce(req, res));
  router.post("/nfce/contingencia", (req, res) => controller.sincronizarNfceContingencia(req, res));
  
  router.post("/validate-xml", (req, res) => controller.validateFiscalXml(req, res));
  router.post("/sat/imprimir", (req, res) => controller.imprimirCupomSat(req, res));
  router.post("/sped", (req, res) => controller.gerarSpedFiscal(req, res));
  router.post("/contabilidade/enviar", (req, res) => controller.enviarDadosContabilidade(req, res));

  return router;
}
