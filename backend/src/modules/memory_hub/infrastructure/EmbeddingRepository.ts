import Database from "better-sqlite3"

export interface MemoryEmbedding {
  chunkId: string
  embedding: number[]
  model: string
  createdAt: number
}

export class EmbeddingRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  insert(embedding: MemoryEmbedding): void {
    const buffer = Buffer.from(new Float32Array(embedding.embedding).buffer)
    this.db.prepare(
      `INSERT INTO embeddings (chunk_id, embedding, model, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(chunk_id, model) DO UPDATE SET
         embedding = excluded.embedding,
         created_at = excluded.created_at`,
    ).run(embedding.chunkId, buffer, embedding.model, embedding.createdAt)
  }

  bulkInsert(embeddings: MemoryEmbedding[]): void {
    const insert = this.db.prepare(
      `INSERT INTO embeddings (chunk_id, embedding, model, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(chunk_id, model) DO UPDATE SET
         embedding = excluded.embedding,
         created_at = excluded.created_at`,
    )

    const insertAll = this.db.transaction((items: typeof embeddings) => {
      for (const e of items) {
        const buffer = Buffer.from(new Float32Array(e.embedding).buffer)
        insert.run(e.chunkId, buffer, e.model, e.createdAt)
      }
    })

    insertAll(embeddings)
  }

  deleteByChunk(chunkId: string): void {
    this.db.prepare("DELETE FROM embeddings WHERE chunk_id = ?").run(chunkId)
  }

  deleteByDocument(documentId: string): void {
    this.db.prepare(
      `DELETE FROM embeddings WHERE chunk_id IN (
        SELECT id FROM chunks WHERE document_id = ?
      )`,
    ).run(documentId)
  }

  searchSimilar(
    embedding: number[],
    model: string,
    limit = 10,
    docTypes?: string[],
  ): Array<{
    chunkId: string
    documentId: string
    sourcePath: string
    content: string
    headingPath: string
    relevanceScore: number
  }> {
    // SQLite doesn't have native vector search.
    // For MVP, load all embeddings for the model and compute cosine similarity in memory.
    // This is acceptable for < 10k chunks. For larger scale, migrate to pgvector or dedicated vector DB.
    const queryBuffer = Buffer.from(new Float32Array(embedding).buffer)
    const queryVec = new Float32Array(queryBuffer.buffer, queryBuffer.byteOffset, queryBuffer.length / 4)

    let sql = `SELECT e.chunk_id, e.embedding, c.document_id, c.content, c.heading_path,
              d.source_path
       FROM embeddings e
       JOIN chunks c ON e.chunk_id = c.id
       JOIN documents d ON c.document_id = d.id
       WHERE e.model = ? AND d.is_archived = 0`
    const params: (string | number)[] = [model]

    if (docTypes && docTypes.length > 0) {
      const placeholders = docTypes.map(() => "?").join(", ")
      sql += ` AND d.doc_type IN (${placeholders})`
      params.push(...docTypes)
    }

    const rows = this.db.prepare(sql).all(...params) as Array<{
      chunk_id: string
      embedding: Buffer
      document_id: string
      content: string
      heading_path: string
      source_path: string
    }>

    const scored = rows.map((row) => {
      const vec = new Float32Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.length / 4)
      const score = this.cosineSimilarity(queryVec, vec)
      return {
        chunkId: row.chunk_id,
        documentId: row.document_id,
        sourcePath: row.source_path,
        content: row.content,
        headingPath: row.heading_path,
        relevanceScore: score,
      }
    })

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)
    return scored.slice(0, limit)
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    if (normA === 0 || normB === 0) return 0
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}
