import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import { Router } from "express";
import { FuncionariosController } from "./controller";

const controller = new FuncionariosController();
const router: Router = Router();
router.use(clinicGuard);

router.get("/", asyncHandler(controller.list.bind(controller)));
router.get("/:id", asyncHandler(controller.getById.bind(controller)));
router.post("/", asyncHandler(controller.create.bind(controller)));
router.patch("/:id", asyncHandler(controller.update.bind(controller)));
router.delete("/:id", asyncHandler(controller.delete.bind(controller)));

export default router;
