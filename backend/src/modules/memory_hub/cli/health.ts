import Database from "better-sqlite3";
import { DocumentRepository } from "../infrastructure/DocumentRepository";

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const db = new Database(dbPath);
const documents = new DocumentRepository(db);

const totalDocs = documents.count();
const allDocs = documents.listAll();
const driftCount = db
  .prepare("SELECT COUNT(*) as c FROM drift_reports WHERE resolved_at IS NULL")
  .get() as { c: number };

const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
const recentlyIndexed = allDocs.filter(
  (d) => d.lastIndexed > oneWeekAgo,
).length;
const coverage =
  totalDocs > 0 ? Math.round((recentlyIndexed / totalDocs) * 100) : 0;

console.log("\n🏥 Memory Hub Health\n");
console.log(`  📊 Documents indexed: ${totalDocs}`);
console.log(`  🔄 Recently indexed:  ${recentlyIndexed} (${coverage}%)`);
console.log(`  ⚠️  Open drift issues: ${driftCount.c}`);
console.log(
  `  📅 Last scan:         ${allDocs[0]?.lastIndexed ? new Date(allDocs[0].lastIndexed).toLocaleString() : "N/A"}`,
);
console.log(`  💾 Index path:        ${dbPath}`);
console.log();

db.close();
