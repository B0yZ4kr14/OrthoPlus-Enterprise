/**
 * Tests for the withTimeout utility (isolated from sw.js).
 */

import { describe, it, expect, vi, afterEach } from "vitest";

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms),
  );
  return Promise.race([promise, timeout]);
}

describe("withTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with the value of the inner promise when it settles in time", async () => {
    const result = await withTimeout(Promise.resolve("value"), 5_000, "fast");
    expect(result).toBe("value");
  });

  it("rejects if the promise does not settle within the timeout", async () => {
    vi.useFakeTimers();

    const slow = new Promise<void>(() => {});
    const raced = withTimeout(slow, 1_000, "slow-sync");

    vi.advanceTimersByTime(1_001);

    await expect(raced).rejects.toThrow("Timeout after 1000ms: slow-sync");
  });

  it("does not reject early if the promise settles just before timeout", async () => {
    vi.useFakeTimers();

    let resolveFn!: () => void;
    const p = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    const raced = withTimeout(p, 500, "near-boundary");

    vi.advanceTimersByTime(499);
    resolveFn();

    await expect(raced).resolves.toBeUndefined();
  });

  it("includes the label in the rejection message", async () => {
    vi.useFakeTimers();

    const p = new Promise<void>(() => {});
    const raced = withTimeout(p, 200, "my-custom-label");

    vi.advanceTimersByTime(300);

    await expect(raced).rejects.toThrow("my-custom-label");
  });

  it("propagates the original rejection from the inner promise", async () => {
    const failing = Promise.reject(new Error("inner error"));
    await expect(withTimeout(failing, 5_000, "failing")).rejects.toThrow(
      "inner error",
    );
  });
});
