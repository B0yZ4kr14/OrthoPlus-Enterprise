import { Router } from "express";
import rateLimit from "express-rate-limit";
import { clinicGuard } from "@/middleware/clinicGuard";
import { MemoryHubController } from "./controller";

export function createMemoryHubRouter(controller: MemoryHubController): Router {
  const router: Router = Router();

  const searchLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many search requests. Please try again later." },
  });

  const briefLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many context brief requests. Please try again later.",
    },
  });

  const reindexLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Reindex rate limit exceeded. Please wait before reindexing.",
    },
  });

  router.use(clinicGuard);

  router.post("/search", searchLimit, controller.search);
  router.post("/reindex", reindexLimit, controller.reindex);
  router.post("/context-brief", briefLimit, controller.contextBrief);
  router.get("/versions", searchLimit, controller.versions);
  router.get("/health", searchLimit, controller.health);
  router.get("/graph", searchLimit, controller.graph);
  router.get("/drift", searchLimit, controller.drift);
  router.get("/costs", searchLimit, controller.costs);

  const adminLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many admin requests. Please wait before retrying." },
  });
  router.post("/rotate-key", adminLimit, controller.rotateKey);

  return router;
}
