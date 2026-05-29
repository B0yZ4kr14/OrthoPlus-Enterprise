import { logger } from "@/infrastructure/logger";

export interface ApiKeyValidationResult {
  valid: boolean;
  provider: string;
  error?: string;
}

/**
 * Validates API key permissions via lightweight test call (MEM-FR-011).
 * For Ollama: checks /api/tags endpoint.
 * For OpenAI/Anthropic/Google: sends a minimal embedding request.
 */
export class ApiKeyValidator {
  async validate(
    provider: string,
    apiKey?: string,
    baseUrl?: string,
  ): Promise<ApiKeyValidationResult> {
    const normalizedProvider = provider.toLowerCase();

    try {
      switch (normalizedProvider) {
        case "ollama":
          return await this.validateOllama(baseUrl);
        case "openai":
          return await this.validateOpenAI(apiKey || "", baseUrl);
        case "anthropic":
          return await this.validateAnthropic(apiKey || "", baseUrl);
        case "google":
          return await this.validateGoogle(apiKey || "", baseUrl);
        default:
          return {
            valid: false,
            provider: normalizedProvider,
            error: `Unknown provider: ${normalizedProvider}`,
          };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[ApiKeyValidator] Validation failed", {
        provider: normalizedProvider,
        error: message,
      });
      return {
        valid: false,
        provider: normalizedProvider,
        error: message,
      };
    }
  }

  private async validateOllama(
    baseUrl?: string,
  ): Promise<ApiKeyValidationResult> {
    const endpoint = (
      baseUrl ||
      process.env.AI_LOCAL_ENDPOINT ||
      "http://localhost:11434"
    ).replace(/\/$/, "");

    const response = await fetch(`${endpoint}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `Ollama unreachable: ${response.status} ${response.statusText}`,
      );
    }

    logger.info("[ApiKeyValidator] Ollama validated successfully", {
      endpoint,
    });
    return { valid: true, provider: "ollama" };
  }

  private async validateOpenAI(
    apiKey: string,
    baseUrl?: string,
  ): Promise<ApiKeyValidationResult> {
    const endpoint = (baseUrl || "https://api.openai.com/v1").replace(
      /\/$/,
      "",
    );

    const response = await fetch(`${endpoint}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: "test",
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `OpenAI validation failed: ${response.status} ${response.statusText} — ${body}`,
      );
    }

    logger.info("[ApiKeyValidator] OpenAI API key validated successfully");
    return { valid: true, provider: "openai" };
  }

  private async validateAnthropic(
    apiKey: string,
    baseUrl?: string,
  ): Promise<ApiKeyValidationResult> {
    const endpoint = (baseUrl || "https://api.anthropic.com/v1").replace(
      /\/$/,
      "",
    );

    const response = await fetch(`${endpoint}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: "test",
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Anthropic validation failed: ${response.status} ${response.statusText} — ${body}`,
      );
    }

    logger.info("[ApiKeyValidator] Anthropic API key validated successfully");
    return { valid: true, provider: "anthropic" };
  }

  private async validateGoogle(
    apiKey: string,
    baseUrl?: string,
  ): Promise<ApiKeyValidationResult> {
    const endpoint = (
      baseUrl || "https://generativelanguage.googleapis.com/v1beta"
    ).replace(/\/$/, "");

    const response = await fetch(
      `${endpoint}/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: "test" }] },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Google validation failed: ${response.status} ${response.statusText} — ${body}`,
      );
    }

    logger.info("[ApiKeyValidator] Google API key validated successfully");
    return { valid: true, provider: "google" };
  }
}
