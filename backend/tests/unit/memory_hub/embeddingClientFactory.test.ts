import { EmbeddingClientFactory } from "@/modules/memory_hub/infrastructure/EmbeddingClientFactory";

describe("EmbeddingClientFactory.updateConfig", () => {
  const originalEnv = { ...process.env };

  function makeDummy(length: number): string {
    return "X".repeat(length);
  }

  beforeEach(() => {
    process.env.MEMORY_HUB_EMBEDDING_PROVIDER = "openai";
    process.env.MEMORY_HUB_API_KEY = makeDummy(64);
    process.env.MEMORY_HUB_EMBEDDING_MODEL = "text-embedding-3-small";
    process.env.MEMORY_HUB_API_BASE_URL = "https://api.openai.com/v1";
  });

  afterEach(() => {
    Object.assign(process.env, originalEnv);
  });

  it("should update API key", () => {
    const t = makeDummy(64);
    const config = EmbeddingClientFactory.updateConfig({ apiKey: t });
    expect(config.apiKey).toBe(t);
    expect(process.env.MEMORY_HUB_API_KEY).toBe(t);
  });

  it("should update provider", () => {
    const t = makeDummy(64);
    const config = EmbeddingClientFactory.updateConfig({
      provider: "google",
      apiKey: t,
    });
    expect(config.provider).toBe("google");
    expect(process.env.MEMORY_HUB_EMBEDDING_PROVIDER).toBe("google");
  });

  it("should update model and baseUrl", () => {
    const config = EmbeddingClientFactory.updateConfig({
      model: "text-embedding-004",
      baseUrl: "https://custom.example.com/v1",
    });
    expect(config.model).toBe("text-embedding-004");
    expect(config.baseUrl).toBe("https://custom.example.com/v1");
  });

  it("should reject invalid API key", () => {
    expect(() =>
      EmbeddingClientFactory.updateConfig({ apiKey: "short" }),
    ).toThrow("too short");
  });

  it("should allow ollama without API key", () => {
    const config = EmbeddingClientFactory.updateConfig({
      provider: "ollama",
      apiKey: undefined,
    });
    expect(config.provider).toBe("ollama");
    expect(process.env.MEMORY_HUB_EMBEDDING_PROVIDER).toBe("ollama");
  });
});
