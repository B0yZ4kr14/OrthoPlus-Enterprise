import Database from "better-sqlite3"
import { ContextBriefService } from "../domain/services/ContextBriefService"
import { SearchService } from "../domain/services/SearchService"
import { EmbeddingClientFactory } from "../infrastructure/EmbeddingClientFactory"
import { EmbeddingRepository } from "../infrastructure/EmbeddingRepository"
import { DocumentRepository } from "../infrastructure/DocumentRepository"

const topic = process.argv.slice(2).join(" ")
if (!topic) {
  console.error("Usage: tsx brief.ts <topic>")
  process.exit(1)
}

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db"
const db = new Database(dbPath)
EmbeddingClientFactory.validateConfig()
const embedder = EmbeddingClientFactory.create()
const embeddings = new EmbeddingRepository(db)
const documents = new DocumentRepository(db)
const searchService = new SearchService(embedder, embeddings, documents)
const briefService = new ContextBriefService(searchService, documents)

briefService.generateBrief(topic)
  .then((brief) => {
    console.log(brief.markdown)
    console.log(`\n---\nDocuments: ${brief.documents.length} | Tokens: ${brief.tokenCount}`)
    db.close()
  })
  .catch((err) => {
    console.error("Brief generation failed:", err)
    db.close()
    process.exit(1)
  })
