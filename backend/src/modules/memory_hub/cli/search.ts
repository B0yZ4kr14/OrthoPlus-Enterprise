import Database from "better-sqlite3"
import { SearchService } from "../domain/services/SearchService"
import { OllamaEmbeddingClient } from "../infrastructure/OllamaEmbeddingClient"
import { EmbeddingRepository } from "../infrastructure/EmbeddingRepository"

const query = process.argv.slice(2).join(" ")
if (!query) {
  console.error("Usage: tsx search.ts <query>")
  process.exit(1)
}

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db"
const db = new Database(dbPath)
const embedder = new OllamaEmbeddingClient()
const embeddings = new EmbeddingRepository(db)
const searchService = new SearchService(embedder, embeddings)

searchService.search(query, {}, 10)
  .then(({ results, total }) => {
    console.log(`\n🔍 Results for: "${query}" (${total} total)\n`)
    for (const r of results) {
      console.log(`  📄 ${r.title} (${r.docType})`)
      console.log(`     📂 ${r.sourcePath}`)
      console.log(`     ⭐ Relevance: ${r.relevanceScore}`)
      console.log(`     📝 ${r.excerpt.slice(0, 200)}`)
      if (r.headingPath.length > 0) {
        console.log(`     🔖 ${r.headingPath.join(" > ")}`)
      }
      console.log()
    }
    db.close()
  })
  .catch((err) => {
    console.error("Search failed:", err)
    db.close()
    process.exit(1)
  })
