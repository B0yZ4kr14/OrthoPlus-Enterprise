import Database from "better-sqlite3";
import { DriftDetectionService } from "../domain/services/DriftDetectionService";
import { DocumentRepository } from "../infrastructure/DocumentRepository";

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const db = new Database(dbPath);
const documents = new DocumentRepository(db);
const detector = new DriftDetectionService(db, documents);

detector
  .detect()
  .then((issues) => {
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
    db.close();
  })
  .catch((err) => {
    console.error("Drift detection failed:", err);
    db.close();
    process.exit(1);
  });
