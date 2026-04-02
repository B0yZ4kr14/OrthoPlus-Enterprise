/**
 * Retry utility for Background Sync operations.
 *
 * Provides `syncWithRetry` — a generic wrapper that retries an async operation
 * with exponential back-off, distinguishing retryable (network / 5xx) errors
 * from non-retryable ones (4xx, validation, etc.).
 */

import { syncLogger } from "./sync-logger";

/** Errors that warrant a retry attempt. */
function isRetryable(error: unknown): boolean {
  if (error instanceof TypeError) {
    // TypeError is thrown by fetch() on network failure
    return true;
  }
  if (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status >= 500;
  }
  if (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: unknown }).code === "NETWORK_ERROR"
  ) {
    return true;
  }
  return false;
}

/**
 * Calculate back-off delay (capped at 30 s).
 * attempt is 1-based: attempt 1 → 2 s, attempt 2 → 4 s, attempt 3 → 8 s …
 */
export function backoffMs(attempt: number): number {
  return Math.min(1_000 * Math.pow(2, attempt), 30_000);
}

/**
 * Execute `operation`, retrying on retryable errors with exponential back-off.
 *
 * @param operation   — Zero-argument async function to run
 * @param maxAttempts — Maximum total attempts (default: 3)
 * @returns The resolved value of the first successful attempt
 * @throws  The last error if all attempts fail or if the error is non-retryable
 */
export async function syncWithRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      if (!isRetryable(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = backoffMs(attempt);
      syncLogger.warn("sync-retry", {
        attempt,
        maxAttempts,
        delay,
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }

  // Unreachable — loop always throws or returns, but satisfies TS return type
  throw lastError;
}
