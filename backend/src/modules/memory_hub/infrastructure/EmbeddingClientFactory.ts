import { EmbeddingClient } from "./EmbeddingClient"
import { OllamaEmbeddingClient } from "./OllamaEmbeddingClient"
import { OpenAIEmbeddingClient } from "./OpenAIEmbeddingClient"
import { logger } from "@/infrastructure/logger"

export interface EmbeddingProviderConfig {
  provider: "ollama" | "openai" | "anthropic" | "google"
  apiKey?: string
  model?: string
  baseUrl?: string
}

export class EmbeddingClientFactory {
  static create(config?: EmbeddingProviderConfig): EmbeddingClient {
    const provider = config?.provider || process.env.MEMORY_HUB_EMBEDDING_PROVIDER || "ollama"
    const apiKey = config?.apiKey || process.env.MEMORY_HUB_API_KEY
    const model = config?.model || process.env.MEMORY_HUB_EMBEDDING_MODEL
    const baseUrl = config?.baseUrl || process.env.MEMORY_HUB_API_BASE_URL

    logger.info("[EmbeddingClientFactory] Creating embedding client", { provider, model: model || "default" })

    switch (provider) {
      case "ollama":
        return new OllamaEmbeddingClient(undefined, model)
      case "openai":
        return new OpenAIEmbeddingClient(
          apiKey || "",
          model || "text-embedding-3-small",
          baseUrl || "https://api.openai.com/v1"
        )
      case "anthropic":
        // Anthropic uses OpenAI-compatible embedding API via third-party providers
        return new OpenAIEmbeddingClient(
          apiKey || "",
          model || "text-embedding-3-small",
          baseUrl || "https://api.anthropic.com/v1"
        )
      case "google":
        return new OpenAIEmbeddingClient(
          apiKey || "",
          model || "text-embedding-004",
          baseUrl || "https://generativelanguage.googleapis.com/v1beta"
        )
      default:
        throw new Error(`[EmbeddingClientFactory] Unknown provider: ${provider}. Supported: ollama, openai, anthropic, google`)
    }
  }

  static validateConfig(): void {
    const provider = process.env.MEMORY_HUB_EMBEDDING_PROVIDER || "ollama"

    if (provider === "ollama") {
      return // Ollama does not require API key
    }

    const apiKey = process.env.MEMORY_HUB_API_KEY
    if (!apiKey) {
      throw new Error(`[SECURITY] MEMORY_HUB_API_KEY must be set when using provider: ${provider}`)
    }
    if (apiKey.length < 16) {
      throw new Error(`[SECURITY] MEMORY_HUB_API_KEY appears invalid (too short) for provider: ${provider}`)
    }
  }
}
