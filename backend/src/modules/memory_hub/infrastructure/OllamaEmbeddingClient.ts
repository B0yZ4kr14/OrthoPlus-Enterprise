import crypto from "crypto"
import { logger } from "@/infrastructure/logger"

export interface EmbeddingResult {
  embedding: number[]
  model: string
}

export class OllamaEmbeddingClient {
  private endpoint: string
  private model: string
  private cache: Map<string, number[]>

  constructor(
    endpoint = process.env.AI_LOCAL_ENDPOINT || "http://localhost:11434",
    model = process.env.MEMORY_HUB_OLLAMA_MODEL || "nomic-embed-text",
  ) {
    this.endpoint = endpoint
    this.model = model
    this.cache = new Map()
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = []
    const uncached: { text: string; index: number; hash: string }[] = []

    // Check cache
    for (let i = 0; i < texts.length; i++) {
      const hash = this.hash(texts[i])
      const cached = this.cache.get(hash)
      if (cached) {
        results[i] = { embedding: cached, model: this.model }
      } else {
        uncached.push({ text: texts[i], index: i, hash })
      }
    }

    if (uncached.length === 0) {
      return results
    }

    // Batch embed via Ollama
    try {
      const response = await fetch(`${this.endpoint}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          input: uncached.map((u) => u.text),
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama embed failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as { embeddings: number[][] }

      for (let i = 0; i < uncached.length; i++) {
        const embedding = data.embeddings[i]
        this.cache.set(uncached[i].hash, embedding)
        results[uncached[i].index] = { embedding, model: this.model }
      }
    } catch (error) {
      logger.error("[OllamaEmbeddingClient] Embed error — failing fast to prevent index corruption", { error, model: this.model })
      throw error instanceof Error ? error : new Error("Ollama embedding failed")
    }

    return results
  }

  async embedSingle(text: string): Promise<EmbeddingResult> {
    const results = await this.embed([text])
    return results[0]
  }

  private hash(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex")
  }
}
