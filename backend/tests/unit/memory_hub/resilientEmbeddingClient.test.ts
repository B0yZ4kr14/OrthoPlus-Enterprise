import {
  EmbeddingClient,
  EmbeddingResult,
} from "@/modules/memory_hub/infrastructure/EmbeddingClient";
import { ResilientEmbeddingClient } from "@/modules/memory_hub/infrastructure/ResilientEmbeddingClient";

class FakeClient extends EmbeddingClient {
  private failCount: number;
  private currentAttempt = 0;

  constructor(failCount: number, model = "fake") {
    super(model);
    this.failCount = failCount;
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    this.currentAttempt++;
    if (this.currentAttempt <= this.failCount) {
      throw new Error(`Fake failure ${this.currentAttempt}`);
    }
    return texts.map(() => ({
      embedding: [1, 2, 3],
      model: this.model,
    }));
  }
}

describe("ResilientEmbeddingClient", () => {
  it("should succeed on first attempt", async () => {
    const primary = new FakeClient(0);
    const resilient = new ResilientEmbeddingClient(primary);
    const result = await resilient.embed(["hello"]);
    expect(result).toHaveLength(1);
    expect(result[0].embedding).toEqual([1, 2, 3]);
  });

  it("should retry and succeed on second attempt", async () => {
    const primary = new FakeClient(1);
    const resilient = new ResilientEmbeddingClient(primary, undefined, {
      maxRetries: 3,
      baseDelayMs: 10,
      maxDelayMs: 100,
    });
    const result = await resilient.embed(["hello"]);
    expect(result).toHaveLength(1);
    expect(result[0].embedding).toEqual([1, 2, 3]);
  });

  it("should use fallback when primary exhausts retries", async () => {
    const primary = new FakeClient(999);
    const fallback = new FakeClient(0, "fallback");
    const resilient = new ResilientEmbeddingClient(primary, fallback, {
      maxRetries: 2,
      baseDelayMs: 10,
      maxDelayMs: 100,
    });
    const result = await resilient.embed(["hello"]);
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("fallback");
  });

  it("should throw when primary and fallback both fail", async () => {
    const primary = new FakeClient(999);
    const fallback = new FakeClient(999);
    const resilient = new ResilientEmbeddingClient(primary, fallback, {
      maxRetries: 1,
      baseDelayMs: 10,
      maxDelayMs: 100,
    });
    await expect(resilient.embed(["hello"])).rejects.toThrow(
      "All embedding attempts failed",
    );
  });

  it("should throw when primary fails and no fallback", async () => {
    const primary = new FakeClient(999);
    const resilient = new ResilientEmbeddingClient(primary, undefined, {
      maxRetries: 1,
      baseDelayMs: 10,
      maxDelayMs: 100,
    });
    await expect(resilient.embed(["hello"])).rejects.toThrow(
      "All embedding attempts failed",
    );
  });
});
