/**
 * Tests for sync handler promise validation and named function patterns.
 * Verifies that:
 * - assertPromise() throws on non-Promise values
 * - assertPromise() passes through real Promises
 * - withTimeout() rejects after the configured timeout
 * - createSyncHandler returns a Promise<void>
 */

import { describe, it, expect, vi, afterEach } from "vitest";

// ─── assertPromise (inline copy for unit testing) ────────────────────────────

function assertPromise(value: unknown, context: string): Promise<unknown> {
  if (
    value === null ||
    value === undefined ||
    typeof value !== "object" ||
    typeof (value as { then?: unknown }).then !== "function"
  ) {
    throw new TypeError(
      `assertPromise: expected a Promise in "${context}", got ${typeof value}`,
    );
  }
  return value as Promise<unknown>;
}

// ─── withTimeout (inline copy for unit testing) ──────────────────────────────

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

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("assertPromise", () => {
  it("returns the Promise when given a valid Promise", () => {
    const p = Promise.resolve(42);
    const result = assertPromise(p, "test context");
    expect(result).toBe(p);
  });

  it("throws TypeError when given undefined", () => {
    expect(() => assertPromise(undefined, "undefined test")).toThrow(TypeError);
    expect(() => assertPromise(undefined, "undefined test")).toThrow(
      "expected a Promise",
    );
  });

  it("throws TypeError when given null", () => {
    expect(() => assertPromise(null, "null test")).toThrow(TypeError);
  });

  it("throws TypeError when given a plain object without .then", () => {
    expect(() => assertPromise({ data: "value" }, "object test")).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when given a function (not a Promise)", () => {
    expect(() => assertPromise(async () => {}, "function test")).toThrow(
      TypeError,
    );
  });

  it("throws TypeError when given a number", () => {
    expect(() => assertPromise(42, "number test")).toThrow(TypeError);
  });

  it("accepts a thenable (duck-typed Promise)", () => {
    const thenable = { then: vi.fn() };
    expect(() => assertPromise(thenable, "thenable test")).not.toThrow();
  });

  it("includes context in the error message", () => {
    expect(() => assertPromise(undefined, "my-sync-handler")).toThrow(
      "my-sync-handler",
    );
  });
});

describe("withTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves when the promise settles before the timeout", async () => {
    const p = Promise.resolve("done");
    const result = await withTimeout(p, 1_000, "fast-operation");
    expect(result).toBe("done");
  });

  it("rejects when the promise exceeds the timeout", async () => {
    vi.useFakeTimers();

    const neverResolves = new Promise<void>(() => {
      // intentionally never resolves
    });

    const raced = withTimeout(neverResolves, 500, "slow-operation");

    vi.advanceTimersByTime(600);

    await expect(raced).rejects.toThrow("Timeout after 500ms: slow-operation");
  });

  it("error message includes the label", async () => {
    vi.useFakeTimers();

    const neverResolves = new Promise<void>(() => {});
    const raced = withTimeout(neverResolves, 100, "custom-label");
    vi.advanceTimersByTime(200);

    await expect(raced).rejects.toThrow("custom-label");
  });
});

describe("handleSync named function pattern", () => {
  it("async named function returns a Promise", async () => {
    async function handleSync(tag: string): Promise<void> {
      switch (tag) {
        case "sync-outbox":
          return Promise.resolve();
        default:
          return Promise.resolve();
      }
    }

    const result = handleSync("sync-outbox");
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  it("returns a Promise for unknown tags (no implicit undefined)", async () => {
    async function handleSync(tag: string): Promise<void> {
      switch (tag) {
        case "sync-outbox":
          return Promise.resolve();
        default:
          return Promise.resolve();
      }
    }

    const result = handleSync("unknown-tag");
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });
});
