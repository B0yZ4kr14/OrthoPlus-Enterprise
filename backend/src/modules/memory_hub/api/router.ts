import { Router } from "express"
import { clinicGuard } from "@/middleware/clinicGuard"
import { MemoryHubController } from "./controller"

const router: Router = Router()
const controller = new MemoryHubController()

router.use(clinicGuard)

router.post("/search", controller.search)
router.post("/reindex", controller.reindex)
router.post("/context-brief", controller.contextBrief)
router.get("/health", controller.health)

export default router
