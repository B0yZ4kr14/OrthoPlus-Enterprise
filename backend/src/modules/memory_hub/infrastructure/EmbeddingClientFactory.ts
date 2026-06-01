import { EmbeddingClient, validateApiKey } from "./EmbeddingClient";
import { OllamaEmbeddingClient } from "./OllamaEmbeddingClient";
import { OpenAIEmbeddingClient } from "./OpenAIEmbeddingClient";
import { ResilientEmbeddingClient } from "./ResilientEmbeddingClient";
import { PIIDetector } from "./PIIDetector";
import { logger } from "@/infrastructure/logger";

export interface EmbeddingProviderConfig {
  provider: "ollama" | "openai" | "anthropic" | "google";
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export class EmbeddingClientFactory {
  static create(config?: EmbeddingProviderConfig): EmbeddingClient {
    const provider =
      config?.provider || process.env.MEMORY_HUB_EMBEDDING_PROVIDER || "ollama";
    const apiKey = config?.apiKey || process.env.MEMORY_HUB_API_KEY;
    const model = config?.model || process.env.MEMORY_HUB_EMBEDDING_MODEL;
    const baseUrl = config?.baseUrl || process.env.MEMORY_HUB_API_BASE_URL;

    logger.info("[EmbeddingClientFactory] Creating embedding client", {
      provider,
      model: model || "default",
    });

    const primary = this.createPrimary(provider, apiKey, model, baseUrl);

    // If primary is not Ollama, create Ollama fallback for resilience (NFR-007)
    if (provider !== "ollama") {
      const fallbackModel =
        process.env.MEMORY_HUB_OLLAMA_MODEL || "nomic-embed-text";
      const fallback = new OllamaEmbeddingClient(undefined, fallbackModel, new PIIDetector());
      return new ResilientEmbeddingClient(primary, fallback);
    }

    return primary;
  }

  private static createPrimary(
    provider: string,
    apiKey: string | undefined,
    model: string | undefined,
    baseUrl: string | undefined,
  ): EmbeddingClient {
    switch (provider) {
      case "ollama":
        return new OllamaEmbeddingClient(undefined, model, new PIIDetector());
      case "openai":
        return new OpenAIEmbeddingClient(
          apiKey || "",
          model || "text-embedding-3-small",
          baseUrl || "https://api.openai.com/v1",
          new PIIDetector(),
        );
      case "anthropic":
        // Anthropic uses OpenAI-compatible embedding API via third-party providers
        return new OpenAIEmbeddingClient(
          apiKey || "",
          model || "text-embedding-3-small",
          baseUrl || "https://api.anthropic.com/v1",
          new PIIDetector(),
        );
      case "google":
        return new OpenAIEmbeddingClient(
          apiKey || "",
          model || "text-embedding-004",
          baseUrl || "https://generativelanguage.googleapis.com/v1beta",
        );
      default:
        throw new Error(
          `[EmbeddingClientFactory] Unknown provider: ${provider}. Supported: ollama, openai, anthropic, google`,
        );
    }
  }

  static validateConfig(): void {
    const provider = process.env.MEMORY_HUB_EMBEDDING_PROVIDER || "ollama";

    if (provider === "ollama") {
      return; // Ollama does not require API key
    }

    const apiKey = process.env.MEMORY_HUB_API_KEY;
    if (!apiKey) {
      throw new Error(
        `[SECURITY] MEMORY_HUB_API_KEY must be set when using provider: ${provider}`,
      );
    }
    if (apiKey.length < 16) {
      throw new Error(
        `[SECURITY] MEMORY_HUB_API_KEY appears invalid (too short) for provider: ${provider}`,
      );
    }
  }

  /**
   * Hot-swap API key and/or provider configuration at runtime (FR-012).
   * Updates process.env variables so the next client creation uses new values.
   * Returns the updated provider configuration.
   */
  static updateConfig(
    updates: Partial<EmbeddingProviderConfig>,
  ): EmbeddingProviderConfig {
    const current: EmbeddingProviderConfig = {
      provider: (process.env.MEMORY_HUB_EMBEDDING_PROVIDER ||
        "ollama") as EmbeddingProviderConfig["provider"],
      apiKey: process.env.MEMORY_HUB_API_KEY,
      model: process.env.MEMORY_HUB_EMBEDDING_MODEL,
      baseUrl: process.env.MEMORY_HUB_API_BASE_URL,
    };

    const next = { ...current, ...updates };

    if (next.provider !== "ollama") {
      validateApiKey(next.provider, next.apiKey);
    }

    if (updates.provider !== undefined) {
      process.env.MEMORY_HUB_EMBEDDING_PROVIDER = updates.provider;
    }
    if (updates.apiKey !== undefined) {
      process.env.MEMORY_HUB_API_KEY = updates.apiKey;
    }
    if (updates.model !== undefined) {
      process.env.MEMORY_HUB_EMBEDDING_MODEL = updates.model;
    }
    if (updates.baseUrl !== undefined) {
      process.env.MEMORY_HUB_API_BASE_URL = updates.baseUrl;
    }

    logger.info("[EmbeddingClientFactory] Configuration updated at runtime", {
      provider: next.provider,
      model: next.model || "default",
    });

    return next;
  }
}
