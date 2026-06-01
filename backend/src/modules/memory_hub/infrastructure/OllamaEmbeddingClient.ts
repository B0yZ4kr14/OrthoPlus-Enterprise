import crypto from "crypto";
import { EmbeddingClient, EmbeddingResult } from "./EmbeddingClient";
import { PIIDetector } from "./PIIDetector";
import { logger } from "@/infrastructure/logger";

export class OllamaEmbeddingClient extends EmbeddingClient {
  private endpoint: string;
  private piiDetector?: PIIDetector;

  constructor(
    endpoint = process.env.AI_LOCAL_ENDPOINT || "http://localhost:11434",
    model = process.env.MEMORY_HUB_OLLAMA_MODEL || "nomic-embed-text",
    piiDetector?: PIIDetector,
  ) {
    super(model);
    this.endpoint = endpoint.replace(/\/$/, "");
    this.piiDetector = piiDetector;
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    const { results, uncached } = this.getCached(texts);

    if (uncached.length === 0) {
      return results as EmbeddingResult[];
    }

    // PII check before sending to external embedding service
    if (this.piiDetector) {
      for (const item of uncached) {
        const result = this.piiDetector.scan(item.text);
        if (result.hasPII && result.confidence === "high") {
          logger.error("[OllamaEmbeddingClient] PII detected in embedding text — blocking", {
            detectedTypes: result.detectedTypes,
            matchCount: result.matchCount,
          });
          throw new Error(
            `PII detected in embedding text (${result.detectedTypes.join(", ")}) — blocked by security policy`,
          );
        }
      }
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
