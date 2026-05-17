import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import { DatabaseAdminController } from "./DatabaseAdminController";
import { MasterDatabaseController } from "./MasterDatabaseController";

const router: Router = Router();
router.use(clinicGuard);

const databaseAdminController = new DatabaseAdminController();
const masterController = new MasterDatabaseController();

// ─── Database Admin (legacy) ───
// /api/database_admin/maintenance
router.post("/maintenance", databaseAdminController.runMaintenance);

// /api/database_admin/health
router.get("/health", databaseAdminController.getHealth);

// /api/database_admin/audit_logs
router.get("/audit_logs", databaseAdminController.getAuditLogs);
router.post("/audit_logs", databaseAdminController.createAuditLog);

// ─── Master Database (federation hub) ───
// /api/database_admin/categories
router.get("/categories", masterController.getCategories);

// /api/database_admin/master/health
router.get("/master/health", masterController.getMasterHealth);

// /api/database_admin/master/stats
router.get("/master/stats", masterController.getMasterStats);

// /api/database_admin/master/cross-query
router.post("/master/cross-query", masterController.crossQuery);

// ─── Circuit Breaker ───
// /api/database_admin/circuit/metrics
router.get("/circuit/metrics", masterController.getCircuitMetrics);

// /api/database_admin/circuit/reset/:category
router.post("/circuit/reset/:category", masterController.resetCircuit);

// /api/database_admin/circuit/reset-all
router.post("/circuit/reset-all", masterController.resetCircuit);

// ─── Backup Scheduler ───
// /api/database_admin/master/backups
router.get("/master/backups", masterController.getBackupStatus);

// /api/database_admin/master/backup/:category
router.post("/master/backup/:category", masterController.executeBackup);

export default router;
