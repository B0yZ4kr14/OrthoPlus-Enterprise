import {
  quantize,
  dequantize,
  cosineSimilarityQuantized,
  packInt8,
  unpackInt8,
} from "../../../src/modules/memory_hub/infrastructure/Quantization";

describe("T054: Embedding Quantization", () => {
  const sampleEmbedding = [0.1, 0.5, -0.3, 0.8, -0.2, 0.0, 0.9, -0.7];

  it("quantizes float32 to int8", () => {
    const quantized = quantize(sampleEmbedding);
    expect(quantized.values).toBeInstanceOf(Int8Array);
    expect(quantized.values.length).toBe(sampleEmbedding.length);
    expect(quantized.compressionRatio).toBe(4);
    expect(quantized.min).toBe(-0.7);
    expect(quantized.max).toBe(0.9);
  });

  it("dequantizes int8 back to approximate float32", () => {
    const quantized = quantize(sampleEmbedding);
    const restored = dequantize(quantized);
    expect(restored.length).toBe(sampleEmbedding.length);
    // Values should be close (within quantization error)
    for (let i = 0; i < sampleEmbedding.length; i++) {
      expect(restored[i]).toBeCloseTo(sampleEmbedding[i], 1);
    }
  });

  it("handles empty embedding", () => {
    const quantized = quantize([]);
    expect(quantized.values.length).toBe(0);
    expect(quantized.compressionRatio).toBe(1);
  });

  it("handles uniform embedding (all same value)", () => {
    const uniform = [0.5, 0.5, 0.5, 0.5];
    const quantized = quantize(uniform);
    expect(quantized.values.length).toBe(4);
    expect(quantized.max).toBe(0.5);
    expect(quantized.min).toBe(0.5);
  });

  it("packs and unpacks Int8Array correctly", () => {
    const original = new Int8Array([-128, -1, 0, 1, 127]);
    const packed = packInt8(original);
    const unpacked = unpackInt8(packed);
    expect(unpacked).toEqual(original);
  });

  it("computes cosine similarity with quantized embeddings", () => {
    const query = new Float32Array([0.2, 0.4, -0.1, 0.7, -0.3, 0.1, 0.8, -0.6]);
    const quantized = quantize(sampleEmbedding);
    const score = cosineSimilarityQuantized(query, quantized);
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThanOrEqual(-1);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("compression achieves 4x ratio for typical embeddings", () => {
    const typicalEmbedding = Array.from(
      { length: 768 },
      () => Math.random() * 2 - 1,
    );
    const quantized = quantize(typicalEmbedding);
    const originalBytes = typicalEmbedding.length * 4; // float32
    const compressedBytes = quantized.values.length; // int8
    expect(compressedBytes).toBeLessThan(originalBytes);
    expect(originalBytes / compressedBytes).toBe(4);
  });

  it("quantization preserves relative ranking", () => {
    const query = new Float32Array([0.1, 0.2, 0.3]);
    const emb1 = [0.1, 0.2, 0.3];
    const emb2 = [0.5, 0.5, 0.5];
    const emb3 = [-0.1, -0.2, -0.3];

    const q1 = quantize(emb1);
    const q2 = quantize(emb2);
    const q3 = quantize(emb3);

    const s1 = cosineSimilarityQuantized(query, q1);
    const s2 = cosineSimilarityQuantized(query, q2);
    const s3 = cosineSimilarityQuantized(query, q3);

    // emb1 is most similar to query, emb3 is least similar
    expect(s1).toBeGreaterThan(s2);
    expect(s2).toBeGreaterThan(s3);
  });
});
