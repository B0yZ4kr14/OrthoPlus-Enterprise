import Database from "better-sqlite3";
import { DriftDetectionService } from "../domain/services/DriftDetectionService";
import { DocumentRepository } from "../infrastructure/DocumentRepository";
import { DriftRepository } from "../infrastructure/DriftRepository";
import { isJsonMode } from "./jsonMode";

const jsonMode = isJsonMode();
const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const db = new Database(dbPath);
const documents = new DocumentRepository(db);
const driftReports = new DriftRepository(db);
const detector = new DriftDetectionService(documents, driftReports);

detector
  .detect()
  .then((issues) => {
    if (jsonMode) {
      console.log(JSON.stringify({ issueCount: issues.length, issues }, null, 2));
    } else {
      console.log(`\n🔍 Drift Scan Complete: ${issues.length} issues found\n`);
      for (const issue of issues) {
        const severityEmoji = {
          low: "🟢",
          medium: "🟡",
          high: "🟠",
          critical: "🔴",
        };
        console.log(
          `  ${severityEmoji[issue.severity]} [${issue.severity.toUpperCase()}] ${issue.type}`,
        );
        console.log(`     📂 ${issue.sourceDocument}`);
        console.log(`     📝 ${issue.description}`);
        if (issue.targetDocument) {
          console.log(`     ➡️  ${issue.targetDocument}`);
        }
        console.log();
      }
    }
    db.close();
  })
  .catch((err) => {
    if (jsonMode) {
      console.error(JSON.stringify({ error: err.message || String(err) }));
    } else {
      console.error("Drift detection failed:", err);
    }
    db.close();
    process.exit(1);
  });
