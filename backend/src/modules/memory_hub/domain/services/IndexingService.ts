import Database from "better-sqlite3"
import fs from "fs"
import crypto from "crypto"
import { logger } from "@/infrastructure/logger"
import { MarkdownParser } from "../../infrastructure/MarkdownParser"
import { DocumentChunker } from "../../infrastructure/DocumentChunker"
import { OllamaEmbeddingClient } from "../../infrastructure/OllamaEmbeddingClient"
import { DocumentRepository } from "../../infrastructure/DocumentRepository"
import { ChunkRepository } from "../../infrastructure/ChunkRepository"
import { EmbeddingRepository } from "../../infrastructure/EmbeddingRepository"

export class IndexingService {
  private parser: MarkdownParser
  private chunker: DocumentChunker
  private embedder: OllamaEmbeddingClient
  private documents: DocumentRepository
  private chunks: ChunkRepository
  private embeddings: EmbeddingRepository

  constructor(db: Database.Database) {
    this.parser = new MarkdownParser()
    this.chunker = new DocumentChunker()
    this.embedder = new OllamaEmbeddingClient()
    this.documents = new DocumentRepository(db)
    this.chunks = new ChunkRepository(db)
    this.embeddings = new EmbeddingRepository(db)
  }

  async indexFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, "utf-8")
    const contentHash = crypto.createHash("sha256").update(content).digest("hex")
    const stat = fs.statSync(filePath)

    const docType = this.inferDocType(filePath)
    const parsed = this.parser.parse(filePath, content)

    const doc = this.documents.upsert({
      sourcePath: filePath,
      docType,
      title: parsed.title,
      contentHash,
      lastModified: stat.mtimeMs,
      wordCount: content.split(/\s+/).length,
      isArchived: false,
      frontmatter: JSON.stringify(parsed.frontmatter),
    })

    // Delete old chunks and embeddings
    this.chunks.deleteByDocument(doc.id)
    this.embeddings.deleteByDocument(doc.id)

    // Chunk and embed
    const chunks = this.chunker.chunk(parsed.sections)
    const storedChunks = this.chunks.bulkInsert(
      doc.id,
      chunks.map((c) => ({
        content: c.content,
        headingPath: JSON.stringify(c.headingPath),
        startLine: c.startLine,
        endLine: c.endLine,
        tokenCount: c.tokenCount,
      })),
    )

    // Embed in batches of 10
    const batchSize = 10
    for (let i = 0; i < storedChunks.length; i += batchSize) {
      const batch = storedChunks.slice(i, i + batchSize)
      const texts = batch.map((c) => c.content)
      const embedded = await this.embedder.embed(texts)

      const embeddings = embedded.map((e, idx) => ({
        chunkId: batch[idx].id,
        embedding: e.embedding,
        model: e.model,
        createdAt: Date.now(),
      }))

      this.embeddings.bulkInsert(embeddings)
    }

    logger.info(`[IndexingService] Indexed file`, { filePath, chunkCount: storedChunks.length })
  }

  async reindexAll(watchDirs: string[]): Promise<void> {
    const startTime = Date.now()
    let count = 0

    for (const dir of watchDirs) {
      if (!fs.existsSync(dir)) continue
      const files = this.findMarkdownFiles(dir)
      for (const file of files) {
        try {
          await this.indexFile(file)
          count++
        } catch (err) {
          logger.error(`[IndexingService] Failed to index file`, { file, error: err })
        }
      }
    }

    const duration = (Date.now() - startTime) / 1000
    logger.info(`[IndexingService] Reindex complete`, { fileCount: count, durationSeconds: duration })
  }

  archiveFile(filePath: string): void {
    this.documents.archive(filePath)
  }

  private inferDocType(filePath: string): string {
    if (filePath.includes("specs/")) return "spec"
    if (filePath.includes("plan.md")) return "plan"
    if (filePath.includes("architecture")) return "architecture"
    if (filePath.includes("contracts/")) return "contract"
    if (filePath.includes(".specify/memory/")) return "memory"
    if (filePath.includes(".omk/memory/")) return "memory"
    return "doc"
  }

  private findMarkdownFiles(dir: string): string[] {
    const results: string[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        results.push(...this.findMarkdownFiles(fullPath))
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(fullPath)
      }
    }

    return results
  }
}
