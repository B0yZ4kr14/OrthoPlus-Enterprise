import { clinicGuard } from "@/middleware/clinicGuard";
import rateLimit from "express-rate-limit";
import { Router } from "express";
import { CRMController } from "./controller";

const controller = new CRMController();
const router: Router = Router();

const crmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again later.",
});

router.use(crmLimiter);
router.use(clinicGuard);

router.get("/", controller.listLeads);
router.get("/leads", controller.listLeads);
router.get("/leads/:id", controller.getLeadById);
router.post("/leads", controller.createLead);
router.patch("/leads/:id", controller.updateLead);
router.delete("/leads/:id", controller.deleteLead);

export default router;
