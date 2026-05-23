import { Router } from "express"
import rateLimit from "express-rate-limit"
import { clinicGuard } from "@/middleware/clinicGuard"
import { MemoryHubController } from "./controller"

export function createMemoryHubRouter(controller: MemoryHubController): Router {
  const router: Router = Router()

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

  router.post("/search", searchLimit, (req, res) => controller.search(req, res))
  router.post("/reindex", reindexLimit, (req, res) => controller.reindex(req, res))
  router.post("/context-brief", briefLimit, (req, res) => controller.contextBrief(req, res))
  router.get("/versions", searchLimit, (req, res) => controller.versions(req, res))
  router.get("/health", searchLimit, (req, res) => controller.health(req, res))
  router.get("/graph", searchLimit, (req, res) => controller.graph(req, res))

  return router
}
