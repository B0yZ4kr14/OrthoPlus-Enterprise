import crypto from "crypto";
import { EmbeddingClient, EmbeddingResult } from "./EmbeddingClient";
import { logger } from "@/infrastructure/logger";

export class OllamaEmbeddingClient extends EmbeddingClient {
  private endpoint: string;

  constructor(
    endpoint = process.env.AI_LOCAL_ENDPOINT || "http://localhost:11434",
    model = process.env.MEMORY_HUB_OLLAMA_MODEL || "nomic-embed-text",
  ) {
    super(model);
    this.endpoint = endpoint.replace(/\/$/, "");
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    const { results, uncached } = this.getCached(texts);

    if (uncached.length === 0) {
      return results as EmbeddingResult[];
    }

    const requestId = this.generateRequestId();

    try {
      const response = await fetch(`${this.endpoint}/api/embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify({
          model: this.model,
          input: uncached.map((u) => u.text),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Ollama embed failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as { embeddings: number[][] };

      logger.info("[OllamaEmbeddingClient] Embed success", {
        requestId,
        model: this.model,
        chunks: uncached.length,
      });

      const embeddings = data.embeddings;
      return this.storeInCache(uncached, embeddings, results);
    } catch (error) {
      logger.error(
        "[OllamaEmbeddingClient] Embed error — failing fast to prevent index corruption",
        {
          error: (error as Error).message,
          model: this.model,
          requestId,
        },
      );
      throw error instanceof Error
        ? error
        : new Error("Ollama embedding failed");
    }
  }

  private generateRequestId(): string {
    return crypto.randomUUID();
  }
}
