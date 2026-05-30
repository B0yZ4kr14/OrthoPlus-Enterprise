import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { TeleodontoController } from "./controller";

const controller = new TeleodontoController();
const router: Router = Router();
router.use(clinicGuard);

// Rota raiz
router.get("/", controller.listTeleconsultas);

// Teleconsultas CRUD
router.get("/teleconsultas", controller.listTeleconsultas);
router.get("/teleconsultas/:id", controller.getById);
router.post("/teleconsultas", controller.create);
router.patch("/teleconsultas/:id", controller.update);
router.delete("/teleconsultas/:id", controller.delete);

// Session management
router.post("/sessions/start", controller.startSession);
router.post("/sessions/end", controller.endSession);

// Clinical notes and prescriptions
router.post("/notes", controller.addNotes);
router.post("/prescriptions", controller.addPrescription);

export default router;
