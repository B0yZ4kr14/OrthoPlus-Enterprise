import Database from "better-sqlite3";
import { logger } from "@/infrastructure/logger";
import { IndexingService } from "../domain/services/IndexingService";

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const watchDirs = (
  process.env.MEMORY_HUB_WATCH_DIRS || "specs/,docs/,categories/"
)
  .split(",")
  .map((d) => d.trim());

const db = new Database(dbPath);
const indexer = new IndexingService(db);

indexer
  .reindexAll(watchDirs)
  .then(() => {
    logger.info("[ReindexWorker] Complete");
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    logger.error("[ReindexWorker] Failed:", { error: err });
    db.close();
    process.exit(1);
  });
