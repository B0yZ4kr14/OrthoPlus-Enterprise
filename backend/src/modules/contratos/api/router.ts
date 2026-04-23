import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { ContratosController } from "./controller";

const controller = new ContratosController();
const router: Router = Router();
router.use(clinicGuard);

router.get("/", controller.list);
router.get("/templates", controller.listTemplates);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
