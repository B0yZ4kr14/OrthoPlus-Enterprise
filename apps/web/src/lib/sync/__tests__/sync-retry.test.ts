/**
 * Tests for syncWithRetry — exponential back-off retry utility.
 *
 * Verifies:
 * - Successful operation on the first attempt returns immediately
 * - Retryable errors trigger retries with back-off
 * - Non-retryable errors are thrown without retrying
 * - Retries are exhausted after maxAttempts
 * - backoffMs grows exponentially and is capped
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { syncWithRetry, backoffMs } from "../sync-retry";

describe("backoffMs", () => {
  it("returns 2 s for attempt 1", () => {
    expect(backoffMs(1)).toBe(2_000);
  });

  it("returns 4 s for attempt 2", () => {
    expect(backoffMs(2)).toBe(4_000);
  });

  it("returns 8 s for attempt 3", () => {
    expect(backoffMs(3)).toBe(8_000);
  });

  it("is capped at 30 s for large attempt numbers", () => {
    expect(backoffMs(100)).toBe(30_000);
  });
});

describe("syncWithRetry", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves immediately when the first attempt succeeds", async () => {
    const operation = vi.fn().mockResolvedValue("ok");
    const result = await syncWithRetry(operation);
    expect(result).toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries on a network (TypeError) error and succeeds on second attempt", async () => {
    vi.useFakeTimers();

    const networkError = new TypeError("Failed to fetch");
    const operation = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue("recovered");

    const promise = syncWithRetry(operation, 3);

    // Advance past the back-off delay for attempt 1 (2 s)
    await vi.advanceTimersByTimeAsync(2_001);

    const result = await promise;
    expect(result).toBe("recovered");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("retries on a 5xx server error and succeeds on the third attempt", async () => {
    vi.useFakeTimers();

    const serverError = Object.assign(new Error("Internal Server Error"), {
      status: 503,
    });
    const operation = vi
      .fn()
      .mockRejectedValueOnce(serverError)
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue("final-ok");

    const promise = syncWithRetry(operation, 3);

    // Advance past attempt 1 back-off (2 s) and attempt 2 back-off (4 s)
    await vi.advanceTimersByTimeAsync(2_001);
    await vi.advanceTimersByTimeAsync(4_001);

    const result = await promise;
    expect(result).toBe("final-ok");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("throws immediately on a non-retryable 4xx error", async () => {
    const clientError = Object.assign(new Error("Bad Request"), {
      status: 400,
    });
    const operation = vi.fn().mockRejectedValue(clientError);

    await expect(syncWithRetry(operation, 3)).rejects.toThrow("Bad Request");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting all attempts on persistent retryable errors", async () => {
    vi.useFakeTimers();

    const networkError = new TypeError("Network failure");
    const operation = vi.fn().mockRejectedValue(networkError);

    const promise = syncWithRetry(operation, 3);
    // Attach the rejection handler BEFORE advancing timers to avoid unhandled-rejection warnings
    const assertion = expect(promise).rejects.toThrow("Network failure");

    // Advance through all back-off intervals
    await vi.advanceTimersByTimeAsync(2_001); // attempt 1 → 2 back-off
    await vi.advanceTimersByTimeAsync(4_001); // attempt 2 → 3 back-off

    await assertion;
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("returns a Promise (not undefined)", async () => {
    const operation = vi.fn().mockResolvedValue(undefined);
    const result = syncWithRetry(operation);
    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  it("uses maxAttempts = 3 by default", async () => {
    vi.useFakeTimers();

    const networkError = new TypeError("Persistent");
    const operation = vi.fn().mockRejectedValue(networkError);

    const promise = syncWithRetry(operation); // default maxAttempts = 3
    // Attach rejection handler before advancing timers
    const assertion = expect(promise).rejects.toThrow("Persistent");

    await vi.advanceTimersByTimeAsync(2_001);
    await vi.advanceTimersByTimeAsync(4_001);

    await assertion;
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("retries when error code is NETWORK_ERROR", async () => {
    vi.useFakeTimers();

    const networkCodeError = Object.assign(new Error("Offline"), {
      code: "NETWORK_ERROR",
    });
    const operation = vi
      .fn()
      .mockRejectedValueOnce(networkCodeError)
      .mockResolvedValue("back-online");

    const promise = syncWithRetry(operation, 3);
    await vi.advanceTimersByTimeAsync(2_001);

    const result = await promise;
    expect(result).toBe("back-online");
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
