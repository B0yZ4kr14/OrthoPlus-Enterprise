import { Router } from "express";
import { TISSController } from "./controller";

const controller = new TISSController();
const router = Router();

// Guias TISS
router.get("/guias", (req, res) => controller.listGuias(req, res));
router.get("/guias/:id", (req, res) => controller.getGuiaById(req, res));
router.post("/guias", (req, res) => controller.createGuia(req, res));
router.patch("/guias/:id", (req, res) => controller.updateGuia(req, res));
router.delete("/guias/:id", (req, res) => controller.deleteGuia(req, res));

// Lotes TISS
router.get("/lotes", (req, res) => controller.listLotes(req, res));
router.post("/lotes", (req, res) => controller.createLote(req, res));
router.patch("/lotes/:id", (req, res) => controller.updateLote(req, res));

// Batch submission — group guides and submit to insurance
router.post("/lotes/submit", (req, res) => controller.submitBatch(req, res));

// Statistics
router.get("/statistics", (req, res) => controller.getStatistics(req, res));

export default router;
