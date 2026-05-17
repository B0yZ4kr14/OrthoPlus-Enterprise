import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { OrcamentosController } from "./controller";

const controller = new OrcamentosController();
const router: Router = Router();
router.use(clinicGuard);

router.get("/", (req, res) => controller.list(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.put("/:id", (req, res) => controller.update(req, res));  // alias for frontend compatibility
router.delete("/:id", (req, res) => controller.delete(req, res));

// Workflow actions
router.patch("/:id/enviar", (req, res) => controller.enviar(req, res));
router.patch("/:id/aprovar", (req, res) => controller.aprovar(req, res));
router.patch("/:id/rejeitar", (req, res) => controller.rejeitar(req, res));

// Items
router.get("/:orcamento_id/items", (req, res) => controller.listItems(req, res));
router.post("/:orcamento_id/items", (req, res) => controller.addItem(req, res));

export default router;
