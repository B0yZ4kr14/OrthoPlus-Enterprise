import { clinicGuard } from "@/middleware/clinicGuard";
import { asyncHandler } from "@/middleware/errorHandler";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import { InadimplenciaController } from "./controller";

const controller = new InadimplenciaController();
const router: Router = Router();

const inadimplenciaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later.",
});

router.use(inadimplenciaLimiter);
router.use(clinicGuard);

// Root route — module status
router.get("/", (_req, res) => {
  res.json({
    module: "inadimplencia",
    version: "1.0.0",
    endpoints: ["/"],
    status: "active",
    note: "Module routes available — see router.ts for full endpoint list",
  });
});

// Inadimplentes
router.get(
  "/inadimplentes",
  asyncHandler(controller.listInadimplentes.bind(controller)),
);
router.get(
  "/inadimplentes/:id",
  asyncHandler(controller.getInadimplente.bind(controller)),
);
router.patch(
  "/inadimplentes/:id",
  asyncHandler(controller.updateInadimplente.bind(controller)),
);

// Campanhas de cobrança
router.get(
  "/campanhas",
  asyncHandler(controller.listCampanhasCobranca.bind(controller)),
);
router.post(
  "/campanhas",
  asyncHandler(controller.createCampanhaCobranca.bind(controller)),
);
router.patch(
  "/campanhas/:id",
  asyncHandler(controller.updateCampanhaCobranca.bind(controller)),
);

export default router;
