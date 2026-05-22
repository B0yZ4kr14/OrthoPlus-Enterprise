import Database from "better-sqlite3"
import { logger } from "@/infrastructure/logger"
import { DriftDetectionService } from "../domain/services/DriftDetectionService"

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db"
const db = new Database(dbPath)
const detector = new DriftDetectionService(db)

detector.detect()
  .then((issues) => {
    logger.info(`[DriftScanWorker] Detected ${issues.length} issues`)
    db.close()
    process.exit(0)
  })
  .catch((err) => {
    logger.error("[DriftScanWorker] Failed:", { error: err })
    db.close()
    process.exit(1)
  })
