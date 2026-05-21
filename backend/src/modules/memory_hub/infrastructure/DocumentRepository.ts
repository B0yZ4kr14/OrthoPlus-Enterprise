import Database from "better-sqlite3"
import crypto from "crypto"

export interface MemoryDocument {
  id: string
  sourcePath: string
  docType: string
  title: string
  contentHash: string
  lastIndexed: number
  lastModified: number
  version: number
  wordCount: number
  isArchived: boolean
  frontmatter: string
}

export class DocumentRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  upsert(doc: Omit<MemoryDocument, "id" | "version" | "lastIndexed">): MemoryDocument {
    const existing = this.db
      .prepare("SELECT * FROM documents WHERE source_path = ?")
      .get(doc.sourcePath) as MemoryDocument | undefined

    const now = Date.now()
    const contentHash = doc.contentHash

    if (existing) {
      if (existing.contentHash === contentHash) {
        // No change, just update last_indexed
        this.db.prepare(
          "UPDATE documents SET last_indexed = ? WHERE id = ?",
        ).run(now, existing.id)
        return { ...existing, last_indexed: now } as MemoryDocument
      }

      // Content changed, increment version
      const newVersion = (existing.version || 1) + 1
      this.db.prepare(
        `UPDATE documents SET
          doc_type = ?, title = ?, content_hash = ?, last_indexed = ?,
          last_modified = ?, version = ?, word_count = ?, is_archived = ?,
          frontmatter = ?
        WHERE id = ?`,
      ).run(
        doc.docType, doc.title, contentHash, now,
        doc.lastModified, newVersion, doc.wordCount,
        doc.isArchived ? 1 : 0, doc.frontmatter, existing.id,
      )

      return this.findById(existing.id)!
    }

    // New document
    const id = crypto.randomUUID()
    this.db.prepare(
      `INSERT INTO documents
        (id, source_path, doc_type, title, content_hash, last_indexed,
         last_modified, version, word_count, is_archived, frontmatter)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id, doc.sourcePath, doc.docType, doc.title, contentHash, now,
      doc.lastModified, 1, doc.wordCount,
      doc.isArchived ? 1 : 0, doc.frontmatter,
    )

    return this.findById(id)!
  }

  findById(id: string): MemoryDocument | undefined {
    return this.db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as MemoryDocument | undefined
  }

  findByPath(sourcePath: string): MemoryDocument | undefined {
    return this.db.prepare("SELECT * FROM documents WHERE source_path = ?").get(sourcePath) as MemoryDocument | undefined
  }

  archive(sourcePath: string): void {
    this.db.prepare("UPDATE documents SET is_archived = 1 WHERE source_path = ?").run(sourcePath)
  }

  listAll(): MemoryDocument[] {
    return this.db.prepare("SELECT * FROM documents ORDER BY last_indexed DESC").all() as MemoryDocument[]
  }

  count(): number {
    const row = this.db.prepare("SELECT COUNT(*) as c FROM documents").get() as { c: number }
    return row.c
  }
}
