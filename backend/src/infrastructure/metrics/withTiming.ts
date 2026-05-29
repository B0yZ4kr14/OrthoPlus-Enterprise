/**
 * withTiming — Shared helper for Prometheus metric timing observation
 *
 * Wraps an async function call, measures its execution duration in milliseconds,
 * invokes an onSuccess callback with the duration, and re-throws any errors
 * after invoking an optional onError callback.
 */
export interface TimingCallbacks<T> {
  onSuccess: (durationMs: number, result: T) => void;
  onError?: (durationMs: number, error: unknown) => void;
}

export async function withTiming<T>(
  fn: () => Promise<T>,
  callbacks: TimingCallbacks<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    callbacks.onSuccess(durationMs, result);
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    if (callbacks.onError) {
      callbacks.onError(durationMs, error);
    }
    throw error;
  }
}
