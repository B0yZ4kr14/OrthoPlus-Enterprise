import crypto from "crypto";

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

export abstract class EmbeddingClient {
  protected cache: Map<string, number[]>;
  protected model: string;

  constructor(model: string) {
    this.model = model;
    this.cache = new Map();
  }

  abstract embed(texts: string[]): Promise<EmbeddingResult[]>;

  async embedSingle(text: string): Promise<EmbeddingResult> {
    const results = await this.embed([text]);
    return results[0];
  }

  protected hash(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex");
  }

  protected getCached(texts: string[]): {
    results: (EmbeddingResult | undefined)[];
    uncached: { text: string; index: number; hash: string }[];
  } {
    const results: (EmbeddingResult | undefined)[] = new Array(texts.length);
    const uncached: { text: string; index: number; hash: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
      const h = this.hash(texts[i]);
      const cached = this.cache.get(h);
      if (cached) {
        results[i] = { embedding: cached, model: this.model };
      } else {
        uncached.push({ text: texts[i], index: i, hash: h });
      }
    }

    return { results, uncached };
  }

  protected storeInCache(
    uncached: { text: string; index: number; hash: string }[],
    embeddings: number[][],
    results: (EmbeddingResult | undefined)[],
  ): EmbeddingResult[] {
    const finalResults = results.slice();
    for (let i = 0; i < uncached.length; i++) {
      const embedding = embeddings[i];
      this.cache.set(uncached[i].hash, embedding);
      finalResults[uncached[i].index] = { embedding, model: this.model };
    }
    return finalResults as EmbeddingResult[];
  }
}

export function validateApiKey(provider: string, apiKey?: string): void {
  if (provider !== "ollama" && !apiKey) {
    throw new Error(`[SECURITY] API key is required for provider: ${provider}`);
  }
  if (apiKey && apiKey.length < 16) {
    throw new Error(
      `[SECURITY] API key appears invalid (too short) for provider: ${provider}`,
    );
  }
}
