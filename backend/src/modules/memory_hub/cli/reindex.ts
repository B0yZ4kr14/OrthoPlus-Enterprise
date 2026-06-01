import Database from "better-sqlite3";
import { IndexingService } from "../domain/services/IndexingService";
import { isJsonMode } from "./jsonMode";

const jsonMode = isJsonMode();
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
    if (jsonMode) {
      console.log(JSON.stringify({ success: true, directories: watchDirs }, null, 2));
    } else {
      console.log("[CLI] Reindex complete");
    }
    db.close();
  })
  .catch((err) => {
    if (jsonMode) {
      console.error(JSON.stringify({ error: err.message || String(err) }));
    } else {
      console.error("[CLI] Reindex failed:", err);
    }
    db.close();
    process.exit(1);
  });
