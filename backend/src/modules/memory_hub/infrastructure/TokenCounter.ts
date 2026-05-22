import { encode } from "gpt-tokenizer"

/**
 * Accurate token counting using gpt-tokenizer (cl100k_base).
 * Replaces the previous word-based approximation (1 word ~ 1.3 tokens).
 */
export class TokenCounter {
  /**
   * Count tokens in a text string.
   */
  static count(text: string): number {
    if (!text || text.length === 0) return 0
    try {
      return encode(text).length
    } catch {
      // Fallback: character-based heuristic (~4 chars per token)
      return Math.ceil(text.length / 4)
    }
  }

  /**
   * Count tokens in multiple strings.
   */
  static countMany(texts: string[]): number {
    return texts.reduce((sum, t) => sum + TokenCounter.count(t), 0)
  }

  /**
   * Estimate remaining tokens within a budget.
   */
  static remaining(budget: number, used: number): number {
    return Math.max(0, budget - used)
  }
}
