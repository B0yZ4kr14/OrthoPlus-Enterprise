import { ApiKeyValidator } from "../../../src/modules/memory_hub/infrastructure/ApiKeyValidator";

describe("ApiKeyValidator", () => {
  let validator: ApiKeyValidator;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    validator = new ApiKeyValidator();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should validate Ollama successfully", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const result = await validator.validate("ollama");
    expect(result.valid).toBe(true);
    expect(result.provider).toBe("ollama");
  });

  it("should fail Ollama validation when unreachable", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    } as Response);

    const result = await validator.validate("ollama");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Ollama unreachable");
  });

  it("should validate OpenAI successfully", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: jest.fn().mockResolvedValue(""),
    } as unknown as Response);

    const result = await validator.validate(
      "openai",
      "sk-test-key-valid-1234567890",
    );
    expect(result.valid).toBe(true);
    expect(result.provider).toBe("openai");
  });

  it("should fail OpenAI validation on 401", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: jest.fn().mockResolvedValue("Invalid API key"),
    } as unknown as Response);

    const result = await validator.validate("openai", "invalid-key");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("OpenAI validation failed");
  });

  it("should return error for unknown provider", async () => {
    const result = await validator.validate("unknown-provider");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown provider");
  });

  it("should handle network errors gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));

    const result = await validator.validate("ollama");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Network failure");
  });
});
