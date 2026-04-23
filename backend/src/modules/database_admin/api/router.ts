import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { DatabaseAdminController } from "./DatabaseAdminController";

const router: Router = Router();
router.use(clinicGuard);
const databaseAdminController = new DatabaseAdminController();

// /api/db/maintenance
router.post("/maintenance", databaseAdminController.runMaintenance);

// /api/db/health
router.get("/health", databaseAdminController.getHealth);

// /api/db/audit_logs
router.get("/audit_logs", databaseAdminController.getAuditLogs);
router.post("/audit_logs", databaseAdminController.createAuditLog);

export default router;
