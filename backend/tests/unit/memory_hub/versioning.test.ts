import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import os from "os"
import { DocumentRepository } from "../../../src/modules/memory_hub/infrastructure/DocumentRepository"

describe("DocumentRepository Versioning", () => {
  let db: Database.Database
  let repo: DocumentRepository
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-hub-version-test-"))
    const dbPath = path.join(tempDir, "test.db")
    db = new Database(dbPath)

    // Initialize schema
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

      CREATE TABLE document_versions (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        content_hash TEXT NOT NULL,
        title TEXT NOT NULL,
        word_count INTEGER NOT NULL,
        frontmatter TEXT DEFAULT '{}',
        created_at INTEGER NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id)
      );
    `)

    repo = new DocumentRepository(db)
  })

  afterEach(() => {
    db.close()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  describe("T023: reindexing preserves version history", () => {
    it("creates new document with version 1", () => {
      const doc = repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec",
        contentHash: "hash-v1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: JSON.stringify({ version: "1.0" }),
      })

      expect(doc.version).toBe(1)
      expect(doc.sourcePath).toBe("specs/test.md")
      expect(doc.contentHash).toBe("hash-v1")
    })

    it("increments version when content hash changes", () => {
      const doc1 = repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec",
        contentHash: "hash-v1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: JSON.stringify({ version: "1.0" }),
      })

      expect(doc1.version).toBe(1)

      const doc2 = repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec Updated",
        contentHash: "hash-v2",
        lastModified: Date.now(),
        wordCount: 120,
        isArchived: false,
        frontmatter: JSON.stringify({ version: "1.1" }),
      })

      expect(doc2.version).toBe(2)
      expect(doc2.title).toBe("Test Spec Updated")
    })

    it("does not increment version when content hash is unchanged", () => {
      const doc1 = repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec",
        contentHash: "hash-v1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: JSON.stringify({ version: "1.0" }),
      })

      // Small delay to ensure lastIndexed changes
      const doc2 = repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec",
        contentHash: "hash-v1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: JSON.stringify({ version: "1.0" }),
      })

      expect(doc2.version).toBe(1)
      expect(doc2.lastIndexed).toBeGreaterThanOrEqual(doc1.lastIndexed)
    })

    it("saves previous version to document_versions table", () => {
      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec v1",
        contentHash: "hash-v1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: JSON.stringify({ version: "1.0" }),
      })

      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec v2",
        contentHash: "hash-v2",
        lastModified: Date.now(),
        wordCount: 150,
        isArchived: false,
        frontmatter: JSON.stringify({ version: "1.1" }),
      })

      const versions = repo.findVersions("specs/test.md")
      expect(versions.length).toBe(1)
      expect(versions[0].version).toBe(1)
      expect(versions[0].contentHash).toBe("hash-v1")
      expect(versions[0].title).toBe("Test Spec v1")
      expect(versions[0].wordCount).toBe(100)
    })

    it("saves multiple versions on successive changes", () => {
      for (let i = 1; i <= 3; i++) {
        repo.upsert({
        clinicId: "default",
          sourcePath: "specs/test.md",
          docType: "spec",
          title: `Test Spec v${i}`,
          contentHash: `hash-v${i}`,
          lastModified: Date.now(),
          wordCount: 100 + i * 10,
          isArchived: false,
          frontmatter: JSON.stringify({ version: `1.${i - 1}` }),
        })
      }

      const versions = repo.findVersions("specs/test.md")
      expect(versions.length).toBe(2) // versions 1 and 2 saved, current is 3
      expect(versions[0].version).toBe(2)
      expect(versions[1].version).toBe(1)
    })

    it("returns empty array for non-existent document", () => {
      const versions = repo.findVersions("specs/nonexistent.md")
      expect(versions).toEqual([])
    })

    it("returns versions ordered by version descending", () => {
      for (let i = 1; i <= 3; i++) {
        repo.upsert({
        clinicId: "default",
          sourcePath: "specs/test.md",
          docType: "spec",
          title: `Test Spec v${i}`,
          contentHash: `hash-v${i}`,
          lastModified: Date.now(),
          wordCount: 100,
          isArchived: false,
          frontmatter: "{}",
        })
      }

      const versions = repo.findVersions("specs/test.md")
      expect(versions[0].version).toBeGreaterThan(versions[1].version)
    })

    it("archives document marking isArchived true", () => {
      repo.upsert({
        clinicId: "default",
        sourcePath: "specs/test.md",
        docType: "spec",
        title: "Test Spec",
        contentHash: "hash-v1",
        lastModified: Date.now(),
        wordCount: 100,
        isArchived: false,
        frontmatter: "{}",
      })

      repo.archive("specs/test.md")

      const doc = repo.findByPath("specs/test.md")
      expect(doc?.isArchived).toBe(true)
    })

    it("counts documents correctly", () => {
      for (let i = 0; i < 5; i++) {
        repo.upsert({
        clinicId: "default",
          sourcePath: `specs/doc${i}.md`,
          docType: "spec",
          title: `Doc ${i}`,
          contentHash: `hash-${i}`,
          lastModified: Date.now(),
          wordCount: 100,
          isArchived: false,
          frontmatter: "{}",
        })
      }

      expect(repo.count()).toBe(5)
    })

    it("lists all documents ordered by lastIndexed DESC", () => {
      for (let i = 0; i < 3; i++) {
        repo.upsert({
        clinicId: "default",
          sourcePath: `specs/doc${i}.md`,
          docType: "spec",
          title: `Doc ${i}`,
          contentHash: `hash-${i}`,
          lastModified: Date.now(),
          wordCount: 100,
          isArchived: false,
          frontmatter: "{}",
        })
      }

      const all = repo.listAll()
      expect(all.length).toBe(3)
      expect(all[0].lastIndexed).toBeGreaterThanOrEqual(all[1].lastIndexed)
      expect(all[1].lastIndexed).toBeGreaterThanOrEqual(all[2].lastIndexed)
    })
  })
})
