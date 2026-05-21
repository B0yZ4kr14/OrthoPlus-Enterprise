import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import { DocumentRepository } from "../../infrastructure/DocumentRepository"

export interface DriftIssue {
  type: "missing_impl" | "broken_ref" | "outdated_decision" | "orphan_doc"
  severity: "low" | "medium" | "high" | "critical"
  sourceDocument: string
  targetDocument?: string
  description: string
}

export class DriftDetectionService {
  private documents: DocumentRepository
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
    this.documents = new DocumentRepository(db)
  }

  async detect(): Promise<DriftIssue[]> {
    const issues: DriftIssue[] = []

    issues.push(...this.detectBrokenApiRefs())
    issues.push(...this.detectMissingImplementations())
    issues.push(...this.detectOrphanDocs())

    // Store in drift_reports table
    const insert = this.db.prepare(
      `INSERT INTO drift_reports (id, type, severity, source_document, target_document, description, detected_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING`,
    )

    for (const issue of issues) {
      insert.run(
        crypto.randomUUID(),
        issue.type,
        issue.severity,
        issue.sourceDocument,
        issue.targetDocument || null,
        issue.description,
        Date.now(),
      )
    }

    return issues
  }

  private detectBrokenApiRefs(): DriftIssue[] {
    const issues: DriftIssue[] = []
    const allDocs = this.documents.listAll()

    // Simple regex-based check: look for `/api/...` references in specs
    // and check if they exist in backend routes
    // const apiPattern = /\/api\/([a-z-]+)/g

    for (const doc of allDocs) {
      if (!doc.sourcePath.includes("specs/")) continue
      // Note: we don't have raw content in MemoryDocument, this is a limitation
      // For MVP, we skip detailed content scanning and focus on structural checks
    }

    return issues
  }

  private detectMissingImplementations(): DriftIssue[] {
    const issues: DriftIssue[] = []
    const allDocs = this.documents.listAll()

    // Check if specs have corresponding implementation directories
    const specDocs = allDocs.filter((d) => d.sourcePath.includes("specs/"))

    for (const spec of specDocs) {
      const featureName = path.basename(path.dirname(spec.sourcePath))
      const implPath = path.join("backend/src/modules", featureName)
      const frontendPath = path.join("apps/web/src/modules", featureName)

      if (!fs.existsSync(implPath) && !fs.existsSync(frontendPath)) {
        issues.push({
          type: "missing_impl",
          severity: "medium",
          sourceDocument: spec.sourcePath,
          description: `Spec ${featureName} has no corresponding implementation in backend or frontend`,
        })
      }
    }

    return issues
  }

  private detectOrphanDocs(): DriftIssue[] {
    const issues: DriftIssue[] = []
    const allDocs = this.documents.listAll()

    // Find docs not referenced by any other doc (simple heuristic)
    // In a full implementation, we'd cross-reference links between docs
    const orphanThresholdDays = 90
    const threshold = Date.now() - orphanThresholdDays * 24 * 60 * 60 * 1000

    for (const doc of allDocs) {
      if (doc.lastIndexed < threshold && !doc.isArchived) {
        issues.push({
          type: "orphan_doc",
          severity: "low",
          sourceDocument: doc.sourcePath,
          description: `Document not reindexed in ${orphanThresholdDays} days`,
        })
      }
    }

    return issues
  }
}
