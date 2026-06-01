import Database from "better-sqlite3";
import { DocumentRepository } from "../infrastructure/DocumentRepository";
import { DriftRepository } from "../infrastructure/DriftRepository";
import { isJsonMode } from "./jsonMode";

const jsonMode = isJsonMode();
const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const db = new Database(dbPath);
const documents = new DocumentRepository(db);
const driftReports = new DriftRepository(db);

const totalDocs = documents.count();
const allDocs = documents.listAll();
const driftCount = driftReports.countUnresolved();

const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
const recentlyIndexed = allDocs.filter(
  (d) => d.lastIndexed > oneWeekAgo,
).length;
const coverage =
  totalDocs > 0 ? Math.round((recentlyIndexed / totalDocs) * 100) : 0;

const healthData = {
  documentsIndexed: totalDocs,
  recentlyIndexed,
  coveragePercent: coverage,
  openDriftIssues: driftCount,
  lastScan: allDocs[0]?.lastIndexed
    ? new Date(allDocs[0].lastIndexed).toISOString()
    : null,
  indexPath: dbPath,
};

if (jsonMode) {
  console.log(JSON.stringify(healthData, null, 2));
} else {
  console.log("\n🏥 Memory Hub Health\n");
  console.log(`  📊 Documents indexed: ${healthData.documentsIndexed}`);
  console.log(`  🔄 Recently indexed:  ${healthData.recentlyIndexed} (${healthData.coveragePercent}%)`);
  console.log(`  ⚠️  Open drift issues: ${healthData.openDriftIssues}`);
  console.log(
    `  📅 Last scan:         ${healthData.lastScan ? new Date(healthData.lastScan).toLocaleString() : "N/A"}`,
  );
  console.log(`  💾 Index path:        ${healthData.indexPath}`);
  console.log();
}

db.close();
