import Database from "better-sqlite3"
import {
  quantize,
  cosineSimilarityQuantized,
  packInt8,
  unpackInt8,
  type QuantizedEmbedding,
} from "./Quantization"

export interface MemoryEmbedding {
  chunkId: string
  embedding: number[]
  model: string
  createdAt: number
}

export interface CompressionStats {
  totalEmbeddings: number
  compressedEmbeddings: number
  compressionRatio: number
  spaceSavedBytes: number
}

export class EmbeddingRepository {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  insert(embedding: MemoryEmbedding, useCompression = false): void {
    if (useCompression) {
      const quantized = quantize(embedding.embedding)
      const buffer = packInt8(quantized.values)
      this.db.prepare(
        `INSERT INTO embeddings (chunk_id, embedding, model, is_compressed, quant_min, quant_max, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(chunk_id, model) DO UPDATE SET
           embedding = excluded.embedding,
           is_compressed = excluded.is_compressed,
           quant_min = excluded.quant_min,
           quant_max = excluded.quant_max,
           created_at = excluded.created_at`,
      ).run(
        embedding.chunkId,
        buffer,
        embedding.model,
        1,
        quantized.min,
        quantized.max,
        embedding.createdAt,
      )
    } else {
      const buffer = Buffer.from(new Float32Array(embedding.embedding).buffer)
      this.db.prepare(
        `INSERT INTO embeddings (chunk_id, embedding, model, is_compressed, quant_min, quant_max, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(chunk_id, model) DO UPDATE SET
           embedding = excluded.embedding,
           is_compressed = excluded.is_compressed,
           quant_min = excluded.quant_min,
           quant_max = excluded.quant_max,
           created_at = excluded.created_at`,
      ).run(
        embedding.chunkId,
        buffer,
        embedding.model,
        0,
        null,
        null,
        embedding.createdAt,
      )
    }
  }

  bulkInsert(embeddings: MemoryEmbedding[], useCompression = false): void {
    const insert = this.db.prepare(
      `INSERT INTO embeddings (chunk_id, embedding, model, is_compressed, quant_min, quant_max, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(chunk_id, model) DO UPDATE SET
         embedding = excluded.embedding,
         is_compressed = excluded.is_compressed,
         quant_min = excluded.quant_min,
         quant_max = excluded.quant_max,
         created_at = excluded.created_at`,
    )

    const insertAll = this.db.transaction((items: typeof embeddings) => {
      for (const e of items) {
        if (useCompression) {
          const quantized = quantize(e.embedding)
          const buffer = packInt8(quantized.values)
          insert.run(e.chunkId, buffer, e.model, 1, quantized.min, quantized.max, e.createdAt)
        } else {
          const buffer = Buffer.from(new Float32Array(e.embedding).buffer)
          insert.run(e.chunkId, buffer, e.model, 0, null, null, e.createdAt)
        }
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
    clinicId = "default",
    author?: string,
    featureNumber?: string,
    dateFrom?: number,
    dateTo?: number,
  ): Array<{
    chunkId: string
    documentId: string
    sourcePath: string
    content: string
    headingPath: string
    relevanceScore: number
  }> {
    const queryBuffer = Buffer.from(new Float32Array(embedding).buffer)
    const queryVec = new Float32Array(queryBuffer.buffer, queryBuffer.byteOffset, queryBuffer.length / 4)

    let sql = `SELECT e.chunk_id, e.embedding, e.is_compressed, e.quant_min, e.quant_max,
              c.document_id, c.content, c.heading_path, d.source_path
       FROM embeddings e
       JOIN chunks c ON e.chunk_id = c.id
       JOIN documents d ON c.document_id = d.id
       WHERE e.model = ? AND d.is_archived = 0 AND d.clinic_id = ?`
    const params: (string | number | null)[] = [model, clinicId]

    if (docTypes && docTypes.length > 0) {
      const placeholders = docTypes.map(() => "?").join(", ")
      sql += ` AND d.doc_type IN (${placeholders})`
      params.push(...docTypes)
    }

    if (author) {
      sql += ` AND d.author = ?`
      params.push(author)
    }

    if (featureNumber) {
      sql += ` AND d.feature_number = ?`
      params.push(featureNumber)
    }

    if (dateFrom) {
      sql += ` AND d.last_modified >= ?`
      params.push(dateFrom)
    }

    if (dateTo) {
      sql += ` AND d.last_modified <= ?`
      params.push(dateTo)
    }

    const rows = this.db.prepare(sql).all(...params) as Array<{
      chunk_id: string
      embedding: Buffer
      is_compressed: number
      quant_min: number | null
      quant_max: number | null
      document_id: string
      content: string
      heading_path: string
      source_path: string
    }>

    const scored = rows.map((row) => {
      let score: number
      if (row.is_compressed === 1 && row.quant_min !== null && row.quant_max !== null) {
        const quantized: QuantizedEmbedding = {
          values: unpackInt8(row.embedding),
          min: row.quant_min,
          max: row.quant_max,
          compressionRatio: 4,
        }
        score = cosineSimilarityQuantized(queryVec, quantized)
      } else {
        const vec = new Float32Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.length / 4)
        score = this.cosineSimilarity(queryVec, vec)
      }
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

  getCompressionStats(): CompressionStats {
    const totalRow = this.db.prepare("SELECT COUNT(*) as c FROM embeddings").get() as { c: number }
    const compressedRow = this.db.prepare(
      "SELECT COUNT(*) as c FROM embeddings WHERE is_compressed = 1",
    ).get() as { c: number }

    const total = totalRow.c
    const compressed = compressedRow.c

    const spaceSaved = compressed > 0
      ? compressed * 4 * 768 * 4
      : 0

    return {
      totalEmbeddings: total,
      compressedEmbeddings: compressed,
      compressionRatio: total > 0 ? (compressed * 4 + (total - compressed)) / total : 1,
      spaceSavedBytes: spaceSaved,
    }
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
