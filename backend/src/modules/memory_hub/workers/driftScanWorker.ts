import Database from "better-sqlite3"
import { DriftDetectionService } from "../domain/services/DriftDetectionService"

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db"
const db = new Database(dbPath)
const detector = new DriftDetectionService(db)

detector.detect()
  .then((issues) => {
    console.log(`[DriftScanWorker] Detected ${issues.length} issues`)
    db.close()
    process.exit(0)
  })
  .catch((err) => {
    console.error("[DriftScanWorker] Failed:", err)
    db.close()
    process.exit(1)
  })
