import Database from "better-sqlite3";
import { SearchService } from "../domain/services/SearchService";
import { EmbeddingClientFactory } from "../infrastructure/EmbeddingClientFactory";
import { EmbeddingRepository } from "../infrastructure/EmbeddingRepository";
import { isJsonMode } from "./jsonMode";

const jsonMode = isJsonMode();
const query = process.argv.slice(2).join(" ");
if (!query) {
  console.error("Usage: tsx search.ts [--json] <query>");
  process.exit(1);
}

const dbPath = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db";
const db = new Database(dbPath);
EmbeddingClientFactory.validateConfig();
const embedder = EmbeddingClientFactory.create();
const embeddings = new EmbeddingRepository(db);
const searchService = new SearchService(embedder, embeddings);

searchService
  .search(query, {}, 10)
  .then(({ results, total }) => {
    if (jsonMode) {
      console.log(JSON.stringify({ query, total, results }, null, 2));
    } else {
      console.log(`\n🔍 Results for: "${query}" (${total} total)\n`);
      for (const r of results) {
        console.log(`  📄 ${r.title} (${r.docType})`);
        console.log(`     📂 ${r.sourcePath}`);
        console.log(`     ⭐ Relevance: ${r.relevanceScore}`);
        console.log(`     📝 ${r.excerpt.slice(0, 200)}`);
        if (r.headingPath.length > 0) {
          console.log(`     🔖 ${r.headingPath.join(" > ")}`);
        }
        console.log();
      }
    }
    db.close();
  })
  .catch((err) => {
    if (jsonMode) {
      console.error(JSON.stringify({ error: err.message || String(err) }));
    } else {
      console.error("Search failed:", err);
    }
    db.close();
    process.exit(1);
  });
