import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import { Router } from "express";
import { OrcamentosController } from "./controller";

const controller = new OrcamentosController();
const router: Router = Router();
router.use(clinicGuard);

router.get("/", asyncHandler(controller.list.bind(controller)));
router.get("/:id", asyncHandler(controller.getById.bind(controller)));
router.post("/", asyncHandler(controller.create.bind(controller)));
router.patch("/:id", asyncHandler(controller.update.bind(controller)));
router.put("/:id", asyncHandler(controller.update.bind(controller))); // alias for frontend compatibility
router.delete("/:id", asyncHandler(controller.delete.bind(controller)));

// Workflow actions
router.patch("/:id/enviar", asyncHandler(controller.enviar.bind(controller)));
router.patch("/:id/aprovar", asyncHandler(controller.aprovar.bind(controller)));
router.patch(
  "/:id/rejeitar",
  asyncHandler(controller.rejeitar.bind(controller)),
);

// Items
router.get(
  "/:orcamento_id/items",
  asyncHandler(controller.listItems.bind(controller)),
);
router.post(
  "/:orcamento_id/items",
  asyncHandler(controller.addItem.bind(controller)),
);

export default router;
