/**
 * Embedding vector quantization utilities (T054)
 * Converts float32 embeddings to int8 for 4x storage reduction.
 * Uses per-vector min/max scaling (asymmetric quantization) to preserve
 * relative distances for cosine similarity search.
 */

export interface QuantizedEmbedding {
  /** Int8 quantized values */
  values: Int8Array;
  /** Original min value for dequantization */
  min: number;
  /** Original max value for dequantization */
  max: number;
  /** Compression ratio achieved */
  compressionRatio: number;
}

/**
 * Quantize a float32 embedding vector to int8.
 * @param embedding Float32 embedding vector
 * @returns Quantized representation with metadata
 */
export function quantize(embedding: number[]): QuantizedEmbedding {
  if (embedding.length === 0) {
    return { values: new Int8Array(0), min: 0, max: 0, compressionRatio: 1 };
  }

  const min = Math.min(...embedding);
  const max = Math.max(...embedding);
  const range = max - min;

  const values = new Int8Array(embedding.length);

  if (range === 0) {
    // All values are the same
    values.fill(0);
    return { values, min, max, compressionRatio: 4 };
  }

  for (let i = 0; i < embedding.length; i++) {
    // Scale to [0, 255] then offset to [-128, 127]
    const normalized = (embedding[i] - min) / range;
    const scaled = Math.round(normalized * 255) - 128;
    values[i] = Math.max(-128, Math.min(127, scaled));
  }

  return { values, min, max, compressionRatio: 4 };
}

/**
 * Dequantize an int8 embedding back to float32.
 * @param quantized Quantized embedding
 * @returns Reconstructed float32 array
 */
export function dequantize(quantized: QuantizedEmbedding): number[] {
  const { values, min, max } = quantized;
  if (values.length === 0) return [];

  const range = max - min;
  const result = new Array<number>(values.length);

  for (let i = 0; i < values.length; i++) {
    const normalized = (values[i] + 128) / 255;
    result[i] = normalized * range + min;
  }

  return result;
}

/**
 * Compute cosine similarity between a float32 query vector and a
 * dequantized embedding, without fully materializing the float32 array.
 * This is ~2x faster than full dequantize + cosineSimilarity.
 */
export function cosineSimilarityQuantized(
  queryVec: Float32Array,
  quantized: QuantizedEmbedding,
): number {
  const { values, min, max } = quantized;
  if (values.length === 0 || queryVec.length !== values.length) return 0;

  const range = max - min;
  if (range === 0) {
    // All quantized values map to the same float; similarity depends only on query
    const constantValue = min;
    let dot = 0;
    let normA = 0;
    for (let i = 0; i < queryVec.length; i++) {
      dot += queryVec[i] * constantValue;
      normA += queryVec[i] * queryVec[i];
    }
    const normB = constantValue * constantValue * queryVec.length;
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < queryVec.length; i++) {
    const deq = ((values[i] + 128) / 255) * range + min;
    dot += queryVec[i] * deq;
    normA += queryVec[i] * queryVec[i];
    normB += deq * deq;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Pack an Int8Array into a Buffer for SQLite BLOB storage.
 */
export function packInt8(values: Int8Array): Buffer {
  return Buffer.from(values.buffer, values.byteOffset, values.byteLength);
}

/**
 * Unpack a Buffer back into an Int8Array.
 */
export function unpackInt8(buffer: Buffer): Int8Array {
  return new Int8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
