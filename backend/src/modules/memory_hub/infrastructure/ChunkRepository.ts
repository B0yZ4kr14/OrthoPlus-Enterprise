import Database from "better-sqlite3"
import crypto from "crypto"

export interface MemoryChunk {
  id: string
  documentId: string
  content: string
  headingPath: string
  startLine: number
  endLine: number
  tokenCount: number
}

export class ChunkRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  bulkInsert(documentId: string, chunks: Omit<MemoryChunk, "id" | "documentId">[]): MemoryChunk[] {
    const insert = this.db.prepare(
      `INSERT INTO chunks (id, document_id, content, heading_path, start_line, end_line, token_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )

    const result: MemoryChunk[] = []

    const insertChunk = this.db.transaction((chunksToInsert: typeof chunks) => {
      for (const chunk of chunksToInsert) {
        const id = crypto.randomUUID()
        insert.run(
          id, documentId, chunk.content, JSON.stringify(chunk.headingPath),
          chunk.startLine, chunk.endLine, chunk.tokenCount,
        )
        result.push({ ...chunk, id, documentId })
      }
    })

    insertChunk(chunks)
    return result
  }

  deleteByDocument(documentId: string): void {
    this.db.prepare("DELETE FROM chunks WHERE document_id = ?").run(documentId)
  }

  findByDocument(documentId: string): MemoryChunk[] {
    const rows = this.db.prepare("SELECT * FROM chunks WHERE document_id = ?").all(documentId) as Array<Record<string, unknown>>
    return rows.map((r) => ({
      id: r.id as string,
      documentId: r.document_id as string,
      content: r.content as string,
      headingPath: JSON.parse(r.heading_path as string),
      startLine: r.start_line as number,
      endLine: r.end_line as number,
      tokenCount: r.token_count as number,
    }))
  }
}
