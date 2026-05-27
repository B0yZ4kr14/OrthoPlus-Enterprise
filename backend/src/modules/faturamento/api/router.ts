import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { FaturamentoController } from "./FaturamentoController";
import { GamificationWorkerController } from "./gamificationWorker";

export function createFaturamentoRouter(): Router {
  const router: Router = Router();
router.use(clinicGuard);
  const controller = new FaturamentoController();

  router.post("/nfes", controller.createNFe);
  router.get("/nfes", controller.listNFes);
  router.post("/nfes/:id/autorizar", controller.autorizarNFe);
  router.post("/nfes/:id/cancelar", controller.cancelarNFe);

  // Gamification Worker
  const gamificationWorker = new GamificationWorkerController();
  router.post("/gamification/process", gamificationWorker.processGoalsAndRankings);

  // Legacy Fiscal Routes
  router.post("/nfce/autorizar", controller.autorizarNfceSefaz);
  router.post("/nfce/carta-correcao", controller.cartaCorrecaoNfce);
  router.post("/nfce/emitir", controller.emitirNfce);
  router.post("/nfce/inutilizar", controller.inutilizarNumeracaoNfce);
  router.post("/nfce/contingencia", controller.sincronizarNfceContingencia);
  
  router.post("/validate-xml", controller.validateFiscalXml);
  router.post("/sat/imprimir", controller.imprimirCupomSat);
  router.post("/sped", controller.gerarSpedFiscal);
  router.post("/contabilidade/enviar", controller.enviarDadosContabilidade);

  // Fiscal Config
  router.get("/config", controller.getConfig);
  router.post("/config", controller.upsertConfig);

  return router;
}
