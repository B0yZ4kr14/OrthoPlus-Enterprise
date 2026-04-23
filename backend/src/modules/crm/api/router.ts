import { Router } from "express";
import { CRMController } from "./controller";

const controller = new CRMController();
const router: Router = Router();

router.get("/leads", controller.listLeads);
router.get("/leads/:id", controller.getLeadById);
router.post("/leads", controller.createLead);
router.patch("/leads/:id", controller.updateLead);
router.delete("/leads/:id", controller.deleteLead);

export default router;
