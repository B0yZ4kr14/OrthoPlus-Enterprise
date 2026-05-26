import { clinicGuard } from "@/middleware/clinicGuard"
import { Router } from "express"
import rateLimit from "express-rate-limit"
import { SearchIndexController } from "./controller"

const controller = new SearchIndexController()
const router: Router = Router()

router.use(clinicGuard)

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many search requests. Please try again later." },
})

const reindexLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Reindex rate limit exceeded. Please wait before reindexing." },
})

router.get("/", searchLimiter, controller.search)
router.post("/reindex/pacientes", reindexLimit, controller.reindexPacientes)
router.post("/reindex/agenda", reindexLimit, controller.reindexAgenda)
router.post("/reindex/pep", reindexLimit, controller.reindexPep)

export default router
