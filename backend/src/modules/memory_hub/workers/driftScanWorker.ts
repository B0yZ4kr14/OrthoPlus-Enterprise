import Database from "better-sqlite3";
import { logger } from "@/infrastructure/logger";
import { DriftDetectionService } from "../domain/services/DriftDetectionService";
import { PathSandbox } from "../infrastructure/PathSandbox";
import { DocumentRepository } from "../infrastructure/DocumentRepository";
import { DriftRepository } from "../infrastructure/DriftRepository";

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const projectRoot = process.env.MEMORY_HUB_PROJECT_ROOT || process.cwd();
const timeoutMs = parseInt(
  process.env.MEMORY_HUB_DRIFT_TIMEOUT || "300000",
  10,
); // default 5min (NFR-005)

// F-RT-020-019: Sandbox drift worker to project root only
const sandbox = new PathSandbox(projectRoot);
const db = new Database(dbPath);
const documents = new DocumentRepository(db);
const driftReports = new DriftRepository(db);
const detector = new DriftDetectionService(documents, driftReports, sandbox);

const startTime = Date.now();

// Timeout enforcement
const timeoutId = setTimeout(() => {
  logger.error("[DriftScanWorker] Timeout exceeded", {
    timeoutMs,
    projectRoot,
  });
  db.close();
  process.exit(1);
}, timeoutMs);

logger.info("[DriftScanWorker] Starting drift scan", {
  projectRoot,
  dbPath,
  timeoutMs,
});

detector
  .detect()
  .then((issues) => {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    logger.info(`[DriftScanWorker] Completed`, {
      issueCount: issues.length,
      durationMs: duration,
      projectRoot,
    });
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    clearTimeout(timeoutId);
    logger.error("[DriftScanWorker] Failed:", { error: err, projectRoot });
    db.close();
    process.exit(1);
  });
