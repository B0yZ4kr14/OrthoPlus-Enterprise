import Database from "better-sqlite3"
import { IndexingService } from "../domain/services/IndexingService"

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db"
const watchDirs = (process.env.MEMORY_HUB_WATCH_DIRS || "specs/,docs/,categories/")
  .split(",")
  .map((d) => d.trim())

const db = new Database(dbPath)
const indexer = new IndexingService(db)

console.log("[CLI] Starting full reindex...")
indexer.reindexAll(watchDirs)
  .then(() => {
    console.log("[CLI] Reindex complete")
    db.close()
  })
  .catch((err) => {
    console.error("[CLI] Reindex failed:", err)
    db.close()
    process.exit(1)
  })
