import { EmbeddingClient, EmbeddingResult } from "./EmbeddingClient";
import { logger } from "@/infrastructure/logger";

export class OpenAIEmbeddingClient extends EmbeddingClient {
  private apiKey: string;
  private baseUrl: string;
  private requestId: string;

  constructor(
    apiKey: string,
    model = "text-embedding-3-small",
    baseUrl = "https://api.openai.com/v1",
  ) {
    super(model);
    if (!apiKey || apiKey.length < 16) {
      throw new Error(`[SECURITY] Valid API key required for OpenAI provider`);
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.requestId = `emb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    const { results, uncached } = this.getCached(texts);

    if (uncached.length === 0) {
      return results as EmbeddingResult[];
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "X-Request-ID": this.requestId,
        },
        body: JSON.stringify({
          model: this.model,
          input: uncached.map((u) => u.text),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "unknown error");
        throw new Error(
          `OpenAI embed failed: ${response.status} ${response.statusText} — ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        data: { embedding: number[] }[];
      };

      const embeddings = data.data.map((d) => d.embedding);
      return this.storeInCache(uncached, embeddings, results);
    } catch (error) {
      logger.error("[OpenAIEmbeddingClient] Embed error", {
        error: (error as Error).message,
        model: this.model,
        requestId: this.requestId,
      });
      throw error instanceof Error
        ? error
        : new Error("OpenAI embedding failed");
    }
  }
}
