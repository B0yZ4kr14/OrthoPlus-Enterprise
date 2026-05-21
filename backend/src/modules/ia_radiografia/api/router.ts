import { Router } from "express"
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
router.post("/consentimento", controller.registrarConsentimento)
router.get("/consentimento/:pacienteId", controller.obterConsentimento)
router.delete("/consentimento/:pacienteId", controller.revogarConsentimento)

// Analises
router.post(
  "/upload-e-analisar",
  upload.single("file"),
  controller.uploadEAnalisar,
)
router.get("/analises", controller.listarAnalises)
router.get("/analises/:id", controller.obterAnalise)
router.patch("/analises/:id/revisar", controller.revisarAnalise)

export default router
