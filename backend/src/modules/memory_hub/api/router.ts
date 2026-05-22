import { Router } from "express"
import rateLimit from "express-rate-limit"
import { clinicGuard } from "@/middleware/clinicGuard"
import { MemoryHubController } from "./controller"

const router: Router = Router()
const controller = new MemoryHubController()

// Rate limiting per Constitution CQ-3
const memoryHubLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests to memory hub. Please try again later." },
})

const reindexLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Reindex rate limit exceeded. Please wait before reindexing." },
})

router.use(clinicGuard)
router.use(memoryHubLimit)

router.post("/search", controller.search)
router.post("/reindex", reindexLimit, controller.reindex)
router.post("/context-brief", controller.contextBrief)
router.get("/versions", controller.versions)
router.get("/health", controller.health)

export default router
