import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { MarketingController } from "./controller";

const controller = new MarketingController();
const router: Router = Router();
router.use(clinicGuard);

// Campanhas
router.get("/campanhas", controller.listCampanhas);
router.get("/campanhas/:id", controller.getCampanhaById);
router.post("/campanhas", controller.createCampanha);
router.patch("/campanhas/:id", controller.updateCampanha);
router.delete("/campanhas/:id", controller.deleteCampanha);

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
