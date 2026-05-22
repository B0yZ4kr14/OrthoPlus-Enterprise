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

interface DocumentRow {
  id: string
  source_path: string
  doc_type: string
  title: string
  content_hash: string
  last_indexed: number
  last_modified: number
  version: number
  word_count: number
  is_archived: number
  frontmatter: string
}

export class DocumentRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  private mapRow(row: DocumentRow): MemoryDocument {
    return {
      id: row.id,
      sourcePath: row.source_path,
      docType: row.doc_type,
      title: row.title,
      contentHash: row.content_hash,
      lastIndexed: row.last_indexed,
      lastModified: row.last_modified,
      version: row.version,
      wordCount: row.word_count,
      isArchived: Boolean(row.is_archived),
      frontmatter: row.frontmatter,
    }
  }

  upsert(doc: Omit<MemoryDocument, "id" | "version" | "lastIndexed">): MemoryDocument {
    const existingRow = this.db
      .prepare("SELECT * FROM documents WHERE source_path = ?")
      .get(doc.sourcePath) as DocumentRow | undefined

    const now = Date.now()
    const contentHash = doc.contentHash

    if (existingRow) {
      const existing = this.mapRow(existingRow)

      if (existing.contentHash === contentHash) {
        // No change, just update last_indexed
        this.db.prepare(
          "UPDATE documents SET last_indexed = ? WHERE id = ?",
        ).run(now, existing.id)
        return { ...existing, lastIndexed: now }
      }

      // Content changed, increment version and archive old version
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

      // Save previous version to history
      this.db.prepare(
        `INSERT INTO document_versions
          (id, document_id, version, content_hash, title, word_count, frontmatter, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        crypto.randomUUID(), existing.id, existing.version, existing.contentHash,
        existing.title, existing.wordCount, existing.frontmatter, now,
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
    const row = this.db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as DocumentRow | undefined
    return row ? this.mapRow(row) : undefined
  }

  findByPath(sourcePath: string): MemoryDocument | undefined {
    const row = this.db.prepare("SELECT * FROM documents WHERE source_path = ?").get(sourcePath) as DocumentRow | undefined
    return row ? this.mapRow(row) : undefined
  }

  archive(sourcePath: string): void {
    this.db.prepare("UPDATE documents SET is_archived = 1 WHERE source_path = ?").run(sourcePath)
  }

  listAll(): MemoryDocument[] {
    const rows = this.db.prepare("SELECT * FROM documents ORDER BY last_indexed DESC").all() as DocumentRow[]
    return rows.map((r) => this.mapRow(r))
  }

  count(): number {
    const row = this.db.prepare("SELECT COUNT(*) as c FROM documents").get() as { c: number }
    return row.c
  }

  findVersions(sourcePath: string): Array<{
    version: number
    contentHash: string
    title: string
    wordCount: number
    createdAt: number
  }> {
    const doc = this.findByPath(sourcePath)
    if (!doc) return []

    const rows = this.db.prepare(
      `SELECT version, content_hash, title, word_count, created_at
       FROM document_versions
       WHERE document_id = ?
       ORDER BY version DESC`
    ).all(doc.id) as Array<{
      version: number
      content_hash: string
      title: string
      word_count: number
      created_at: number
    }>

    return rows.map((r) => ({
      version: r.version,
      contentHash: r.content_hash,
      title: r.title,
      wordCount: r.word_count,
      createdAt: r.created_at,
    }))
  }

  /**
   * Check if a document is marked as confidential based on its frontmatter.
   * Supports: `confidential: true`, `private: true`, `visibility: "private"|"confidential"`
   */
  isConfidential(doc: MemoryDocument): boolean {
    if (!doc.frontmatter) return false
    try {
      const fm = JSON.parse(doc.frontmatter) as Record<string, unknown>
      if (fm.confidential === true) return true
      if (fm.private === true) return true
      const visibility = String(fm.visibility || "").toLowerCase()
      if (visibility === "private" || visibility === "confidential") return true
      return false
    } catch {
      return false
    }
  }
}
