import { Router } from "express"
import { MemoryHubController } from "./controller"

const router: Router = Router()
const controller = new MemoryHubController()

router.post("/search", controller.search)
router.post("/reindex", controller.reindex)
router.post("/context-brief", controller.contextBrief)
router.get("/health", controller.health)

export default router
