import { Router } from "express";
import { MarketingController } from "./controller";

const controller = new MarketingController();
const router: Router = Router();

// Campanhas
router.get("/campanhas", controller.listCampanhas);
router.get("/campanhas/:id", controller.getCampanhaById);
router.post("/campanhas", controller.createCampanha);
router.patch("/campanhas/:id", controller.updateCampanha);

// Envios
router.get("/envios", controller.listEnvios);
router.post("/envios", controller.createEnvio);

// Recalls
router.get("/recalls", controller.listRecalls);
router.post("/recalls", controller.createRecall);

// Trigger processing
router.post("/triggers/process", controller.processTriggers);
router.post("/recalls/process", controller.processRecalls);

export default router;
