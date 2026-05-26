import { Router } from "express"
import { asyncHandler } from "@/middleware/errorHandler"
import { IARadiografiaController } from "./controller"
import { clinicGuard } from "@/middleware/clinicGuard"
import { authMiddleware } from "@/middleware/authMiddleware"
import { aiFeatureFlagGuard } from "./aiFeatureFlagGuard"
import { iaRateLimiter } from "./iaRateLimiter"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })
const router: Router = Router()
const controller = new IARadiografiaController()

// Todas as rotas exigem: auth + clinicGuard + feature flag + rate limit
router.use(authMiddleware)
router.use(clinicGuard)
router.use(aiFeatureFlagGuard)
router.use(iaRateLimiter)

// Consentimento LGPD
router.post("/consentimento", asyncHandler(controller.registrarConsentimento.bind(controller)))
router.get("/consentimento/:pacienteId", asyncHandler(controller.obterConsentimento.bind(controller)))
router.delete("/consentimento/:pacienteId", asyncHandler(controller.revogarConsentimento.bind(controller)))

// Analises
router.post(
  "/upload-e-analisar",
  upload.single("file"),
  asyncHandler(controller.uploadEAnalisar.bind(controller)),
)
router.get("/analises", asyncHandler(controller.listarAnalises.bind(controller)))
router.get("/analises/:id", asyncHandler(controller.obterAnalise.bind(controller)))
router.get("/analises/:id/audit", asyncHandler(controller.obterAuditoriaAnalise.bind(controller)))
router.patch("/analises/:id/revisar", asyncHandler(controller.revisarAnalise.bind(controller)))
router.get("/insights", asyncHandler(controller.obterInsights.bind(controller)))

export default router
