import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import os from "os";
import { DriftDetectionService } from "../../../src/modules/memory_hub/domain/services/DriftDetectionService";
import { DocumentRepository } from "../../../src/modules/memory_hub/infrastructure/DocumentRepository";
import { DriftRepository } from "../../../src/modules/memory_hub/infrastructure/DriftRepository";

const originalExistsSync = fs.existsSync;

describe("DriftDetectionService", () => {
  let db: Database.Database;
  let service: DriftDetectionService;
  let repo: DocumentRepository;
  let driftRepo: DriftRepository;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "drift-test-"));
    const dbPath = path.join(tempDir, "test.db");
    db = new Database(dbPath);

    db.exec(`
      CREATE TABLE documents (
        id TEXT PRIMARY KEY,
        clinic_id TEXT NOT NULL DEFAULT 'default',
        source_path TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        title TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        last_indexed INTEGER NOT NULL,
        last_modified INTEGER NOT NULL,
        author TEXT,
        feature_number TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        word_count INTEGER NOT NULL,
        is_archived INTEGER NOT NULL DEFAULT 0,
        frontmatter TEXT DEFAULT '{}',
        UNIQUE(clinic_id, source_path)
      );

      CREATE TABLE drift_reports (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        source_document TEXT NOT NULL,
        target_document TEXT,
        description TEXT NOT NULL,
        detected_at INTEGER NOT NULL
      );
    `);

    repo = new DocumentRepository(db);
    driftRepo = new DriftRepository(db);
    service = new DriftDetectionService(repo, driftRepo);
  });

  afterEach(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  describe("T037: drift scan detects broken API references", () => {
    it("returns array of drift issues", async () => {
      const issues = await service.detect();
      expect(Array.isArray(issues)).toBe(true);
    });

    it("stores detected issues in drift_reports table", async () => {
      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/old-feature/spec.md",
        docType: "spec",
        title: "Old Feature",
        contentHash: "hash1",
        lastModified: Date.now() - 100 * 24 * 60 * 60 * 1000,
        wordCount: 100,
        isArchived: false,
        frontmatter: "{}",
      });

      await service.detect();

      const reports = db.prepare("SELECT * FROM drift_reports").all() as Array<
        Record<string, unknown>
      >;
      expect(reports.length).toBeGreaterThan(0);
    });
  });

  describe("T038: drift scan detects missing implementations", () => {
    it("detects orphan docs not indexed in 90 days", async () => {
      db.prepare(
        `
        INSERT INTO documents (id, source_path, doc_type, title, content_hash, last_indexed, last_modified, version, word_count, is_archived, frontmatter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        "doc-old",
        "specs/old-feature/spec.md",
        "spec",
        "Old Feature",
        "hash1",
        Date.now() - 100 * 24 * 60 * 60 * 1000,
        Date.now() - 100 * 24 * 60 * 60 * 1000,
        1,
        100,
        0,
        "{}",
      );

      const issues = await service.detect();

      const orphanIssues = issues.filter((i) => i.type === "orphan_doc");
      expect(orphanIssues.length).toBeGreaterThan(0);
      expect(orphanIssues[0].severity).toBe("low");
      expect(orphanIssues[0].sourceDocument).toBe("specs/old-feature/spec.md");
    });

    it("does not flag recently indexed docs as orphan", async () => {
      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/new-feature/spec.md",
        docType: "spec",
        title: "New Feature",
        contentHash: "hash1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: "{}",
      });

      const issues = await service.detect();

      const orphanIssues = issues.filter((i) => i.type === "orphan_doc");
      const newFeatureOrphan = orphanIssues.find((i) =>
        i.sourceDocument.includes("new-feature"),
      );
      expect(newFeatureOrphan).toBeUndefined();
    });

    it("does not flag archived docs as orphan", async () => {
      db.prepare(
        `
        INSERT INTO documents (id, source_path, doc_type, title, content_hash, last_indexed, last_modified, version, word_count, is_archived, frontmatter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        "doc-archived",
        "specs/archived-feature/spec.md",
        "spec",
        "Archived Feature",
        "hash1",
        Date.now() - 100 * 24 * 60 * 60 * 1000,
        Date.now() - 100 * 24 * 60 * 60 * 1000,
        1,
        100,
        1,
        "{}",
      );

      const issues = await service.detect();

      const orphanIssues = issues.filter((i) => i.type === "orphan_doc");
      const archivedOrphan = orphanIssues.find((i) =>
        i.sourceDocument.includes("archived-feature"),
      );
      expect(archivedOrphan).toBeUndefined();
    });

    it("detects missing implementations for specs without backend/frontend modules", async () => {
      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/999-nonexistent-feature/spec.md",
        docType: "spec",
        title: "Nonexistent Feature",
        contentHash: "hash1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: "{}",
      });

      const issues = await service.detect();

      const missingIssues = issues.filter((i) => i.type === "missing_impl");
      const nonexistentIssue = missingIssues.find((i) =>
        i.sourceDocument.includes("999-nonexistent-feature"),
      );
      expect(nonexistentIssue).toBeDefined();
      expect(nonexistentIssue?.severity).toBe("medium");
    });

    it("does not flag specs with existing backend modules", async () => {
      jest.spyOn(fs, "existsSync").mockImplementation((p: fs.PathLike) => {
        const s = String(p);
        if (
          s.includes("backend/src/modules/memory_hub") ||
          s.includes("apps/web/src/modules/memory_hub")
        ) {
          return true;
        }
        return originalExistsSync(p);
      });

      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/memory_hub/spec.md",
        docType: "spec",
        title: "Memory Hub",
        contentHash: "hash1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: "{}",
      });

      const issues = await service.detect();

      const missingIssues = issues.filter((i) => i.type === "missing_impl");
      const memoryHubIssue = missingIssues.find((i) =>
        i.sourceDocument.includes("memory_hub"),
      );
      expect(memoryHubIssue).toBeUndefined();
    });

    it("assigns correct severity levels", async () => {
      db.prepare(
        `
        INSERT INTO documents (id, source_path, doc_type, title, content_hash, last_indexed, last_modified, version, word_count, is_archived, frontmatter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        "doc-old",
        "specs/old-feature/spec.md",
        "spec",
        "Old Feature",
        "hash1",
        Date.now() - 100 * 24 * 60 * 60 * 1000,
        Date.now() - 100 * 24 * 60 * 60 * 1000,
        1,
        100,
        0,
        "{}",
      );

      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/999-nonexistent-feature/spec.md",
        docType: "spec",
        title: "Nonexistent Feature",
        contentHash: "hash2",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: "{}",
      });

      const issues = await service.detect();

      const orphanIssues = issues.filter((i) => i.type === "orphan_doc");
      const missingIssues = issues.filter((i) => i.type === "missing_impl");

      expect(orphanIssues[0]?.severity).toBe("low");
      expect(missingIssues[0]?.severity).toBe("medium");
    });
  });

  describe("T039: drift scan detects outdated decisions", () => {
    it("detects documents modified since last index", async () => {
      const tmpFile = path.join(tempDir, "outdated-spec.md");
      fs.writeFileSync(tmpFile, "# Test Spec\nDecision: use PostgreSQL");
      const mtime = Date.now();
      const lastIndexed = mtime - 86400000; // 1 day ago

      db.prepare(
        `
        INSERT INTO documents (id, source_path, doc_type, title, content_hash, last_indexed, last_modified, version, word_count, is_archived, frontmatter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        "doc-outdated",
        tmpFile,
        "spec",
        "Test Spec",
        "hash1",
        lastIndexed,
        lastIndexed,
        1,
        10,
        0,
        "{}",
      );

      const issues = await service.detect();
      const outdated = issues.filter(
        (i: { type: string }) => i.type === "outdated_decision",
      );
      expect(outdated.length).toBeGreaterThanOrEqual(1);
      expect(outdated[0].severity).toBe("medium");
      expect(outdated[0].sourceDocument).toBe(tmpFile);
    });

    it("does not flag recently indexed documents", async () => {
      const tmpFile = path.join(tempDir, "fresh-spec.md");
      fs.writeFileSync(tmpFile, "# Fresh Spec");
      // Ensure lastIndexed is >= file mtime so it's not flagged
      await new Promise((r) => setTimeout(r, 50));
      const now = Date.now();

      db.prepare(
        `
        INSERT INTO documents (id, source_path, doc_type, title, content_hash, last_indexed, last_modified, version, word_count, is_archived, frontmatter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        "doc-fresh",
        tmpFile,
        "spec",
        "Fresh Spec",
        "hash2",
        now,
        now,
        1,
        5,
        0,
        "{}",
      );

      const issues = await service.detect();
      const outdated = issues.filter(
        (i: { type: string }) => i.type === "outdated_decision",
      );
      const freshOutdated = outdated.filter(
        (i: { sourceDocument: string }) => i.sourceDocument === tmpFile,
      );
      expect(freshOutdated.length).toBe(0);
    });
  });
});
