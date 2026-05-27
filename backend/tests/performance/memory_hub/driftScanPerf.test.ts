/**
 * Drift Scan Performance Benchmark
 * Verifies NFR-005: health scan completes within 5 minutes.
 *
 * TASK-SEC-023
 */

import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import os from "os"
import { DriftDetectionService } from "../../../src/modules/memory_hub/domain/services/DriftDetectionService"
import { DocumentRepository } from "../../../src/modules/memory_hub/infrastructure/DocumentRepository"

describe("DriftScan Performance", () => {
  let db: Database.Database
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-hub-perf-"))
    const indexPath = path.join(tmpDir, "index.db")
    db = new Database(indexPath)

    // Minimal schema for drift testing
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        clinic_id TEXT NOT NULL DEFAULT 'default',
        source_path TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        title TEXT,
        content_hash TEXT NOT NULL,
        last_indexed INTEGER,
        last_modified INTEGER,
        author TEXT,
        feature_number TEXT,
        version INTEGER DEFAULT 1,
        word_count INTEGER,
        is_archived INTEGER DEFAULT 0,
        frontmatter TEXT,
        UNIQUE(clinic_id, source_path)
      );
      CREATE TABLE IF NOT EXISTS drift_reports (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        source_document TEXT NOT NULL,
        target_document TEXT,
        description TEXT NOT NULL,
        detected_at INTEGER NOT NULL,
        UNIQUE(id)
      );
    `)

    // Seed with 1000 mock documents
    const repo = new DocumentRepository(db)
    for (let i = 0; i < 1000; i++) {
      repo.upsert({
        clinicId: "default",
        sourcePath: `specs/${String(i).padStart(3, "0")}-feature/spec.md`,
        docType: "spec",
        title: `Feature ${i}`,
        contentHash: `hash-${i}`,
        lastModified: Date.now(),
        author: null,
        featureNumber: null,
        wordCount: 500,
        isArchived: false,
        frontmatter: "{}",
      })
    }
  })

  afterEach(() => {
    db.close()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it("should complete drift scan within 5 minutes (300000ms)", async () => {
    const { DocumentRepository } = await import("../../../src/modules/memory_hub/infrastructure/DocumentRepository")
    const documents = new DocumentRepository(db)
    const service = new DriftDetectionService(db, documents)

    const start = Date.now()
    const issues = await service.detect()
    const duration = Date.now() - start

    // NFR-005: Health scan < 5 minutes
    expect(duration).toBeLessThan(300000)

    // Log performance metric for CI tracking
    console.log(`[Perf] Drift scan for 1000 docs: ${duration}ms, ${issues.length} issues`)
  })
})
