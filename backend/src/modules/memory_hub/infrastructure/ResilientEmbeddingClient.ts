import { EmbeddingClient, EmbeddingResult } from "./EmbeddingClient";
import { logger } from "@/infrastructure/logger";

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps an embedding client with retry logic (exponential backoff)
 * and optional fallback to a secondary client.
 *
 * NFR-007: Provider failover with primary → secondary → Ollama fallback.
 */
export class ResilientEmbeddingClient extends EmbeddingClient {
  private primary: EmbeddingClient;
  private fallback?: EmbeddingClient;
  private retryConfig: RetryConfig;

  constructor(
    primary: EmbeddingClient,
    fallback?: EmbeddingClient,
    retryConfig: Partial<RetryConfig> = {},
  ) {
    super(primary["model"] || "resilient");
    this.primary = primary;
    this.fallback = fallback;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    const errors: Error[] = [];

    // Attempt primary with exponential backoff
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await this.primary.embed(texts);
        if (attempt > 0) {
          logger.info(
            `[ResilientEmbeddingClient] Primary succeeded after ${attempt} retry(ies)`,
          );
        }
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);

        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelayMs * Math.pow(2, attempt),
            this.retryConfig.maxDelayMs,
          );
          logger.warn(
            `[ResilientEmbeddingClient] Primary attempt ${attempt + 1} failed, retrying in ${delay}ms`,
            { error: err.message },
          );
          await sleep(delay);
        }
      }
    }

    // Primary exhausted all retries — try fallback if available
    if (this.fallback) {
      logger.warn(
        `[ResilientEmbeddingClient] Primary failed after ${this.retryConfig.maxRetries} retries, attempting fallback`,
      );
      try {
        const result = await this.fallback.embed(texts);
        logger.info(`[ResilientEmbeddingClient] Fallback succeeded`);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        logger.error(`[ResilientEmbeddingClient] Fallback also failed`, {
          error: err.message,
        });
      }
    }

    // All attempts failed
    const summary = errors.map((e) => e.message).join("; ");
    throw new Error(
      `[ResilientEmbeddingClient] All embedding attempts failed: ${summary}`,
    );
  }
}
