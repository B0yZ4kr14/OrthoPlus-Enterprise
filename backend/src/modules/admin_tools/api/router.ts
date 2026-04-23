import { Router } from "express";
import { AdminToolsController } from "./controller";

const controller = new AdminToolsController();
const router: Router = Router();

// ADRs
router.get("/adrs", controller.listADRs);
router.post("/adrs", controller.createADR);

// Wiki
router.get("/wiki", controller.listWiki);
router.post("/wiki", controller.createWikiEntry);
router.patch("/wiki/:id", controller.updateWikiEntry);

// Legacy Admin Endpoints
router.post("/create-root-user", controller.createRootUser);
router.get("/analyze-database-health", controller.analyzeDatabaseHealth);
router.all("/github-proxy", controller.githubProxy);

router.get("/global-search", controller.globalSearch);

export default router;
