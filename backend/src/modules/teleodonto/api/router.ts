import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { dbRouter } from "./dbRouter";
import { TeleodontoController } from "./controller";

const controller = new TeleodontoController();
const router: Router = Router();
router.use(clinicGuard);

// Rota raiz
router.get("/", (req, res) => controller.listTeleconsultas(req, res));

// Teleconsultas CRUD
router.get("/teleconsultas", (req, res) => controller.listTeleconsultas(req, res));
router.get("/teleconsultas/:id", (req, res) => controller.getById(req, res));
router.post("/teleconsultas", (req, res) => controller.create(req, res));
router.patch("/teleconsultas/:id", (req, res) => controller.update(req, res));
router.delete("/teleconsultas/:id", (req, res) => controller.delete(req, res));

// Session management
router.post("/sessions/start", (req, res) => controller.startSession(req, res));
router.post("/sessions/end", (req, res) => controller.endSession(req, res));

// Clinical notes and prescriptions
router.post("/notes", (req, res) => controller.addNotes(req, res));
router.post("/prescriptions", (req, res) => controller.addPrescription(req, res));

router.use("/db", dbRouter);

export default router;
