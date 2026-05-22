import { Router } from "express"
import rateLimit from "express-rate-limit"
import { clinicGuard } from "@/middleware/clinicGuard"
import { MemoryHubController } from "./controller"

const router: Router = Router()
const controller = new MemoryHubController()

// Rate limiting per Constitution CQ-3
// F-RT-020-013: Separate stricter limits for expensive endpoints
const searchLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many search requests. Please try again later." },
})

const briefLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // stricter: context-brief triggers expensive Ollama embedding generation
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many context brief requests. Please try again later." },
})

const reindexLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Reindex rate limit exceeded. Please wait before reindexing." },
})

router.use(clinicGuard)

router.post("/search", searchLimit, controller.search)
router.post("/reindex", reindexLimit, controller.reindex)
router.post("/context-brief", briefLimit, controller.contextBrief)
router.get("/versions", searchLimit, controller.versions)
router.get("/health", searchLimit, controller.health)

export default router
