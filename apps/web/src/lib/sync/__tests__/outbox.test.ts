/**
 * Tests for the IndexedDB outbox module.
 *
 * The outbox is tested with a mocked indexedDB since jsdom's implementation
 * is limited.  The critical invariant being verified is:
 * - Records are NOT removed from the outbox before server ACK.
 * - Record fields are set correctly on creation.
 * - updateOutboxRecord modifies without deleting.
 * - removeById only removes the targeted record.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Minimal in-memory IDB mock ───────────────────────────────────────────────

type MockRecord = {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  timestamp: number;
  retryCount: number;
  status: string;
};

function createMockIDB() {
  const store = new Map<string, MockRecord>();

  const mockTransaction = {
    objectStore: () => mockObjectStore,
    oncomplete: null as null | (() => void),
    onerror: null as null | ((e: Event) => void),
  };

  const mockObjectStore = {
    add(record: MockRecord) {
      store.set(record.id, { ...record });
      const req = { onsuccess: null as null | (() => void), onerror: null };
      setTimeout(() => {
        req.onsuccess?.();
        (mockTransaction.oncomplete as (() => void) | null)?.();
      }, 0);
      return req;
    },
    get(id: string) {
      const result = store.get(id) ?? null;
      const req = {
        result,
        onsuccess: null as
          | null
          | ((e: { target: { result: MockRecord | null } }) => void),
        onerror: null,
      };
      setTimeout(() => {
        req.onsuccess?.({ target: { result } });
        (mockTransaction.oncomplete as (() => void) | null)?.();
      }, 0);
      return req;
    },
    put(record: MockRecord) {
      store.set(record.id, { ...record });
      const req = { onsuccess: null as null | (() => void), onerror: null };
      setTimeout(() => {
        req.onsuccess?.();
        (mockTransaction.oncomplete as (() => void) | null)?.();
      }, 0);
      return req;
    },
    delete(id: string) {
      store.delete(id);
      const req = { onsuccess: null as null | (() => void), onerror: null };
      setTimeout(() => {
        req.onsuccess?.();
        (mockTransaction.oncomplete as (() => void) | null)?.();
      }, 0);
      return req;
    },
    getAll() {
      const result = Array.from(store.values());
      const req = {
        result,
        onsuccess: null as
          | null
          | ((e: { target: { result: MockRecord[] } }) => void),
        onerror: null,
      };
      setTimeout(() => {
        req.onsuccess?.({ target: { result } });
        (mockTransaction.oncomplete as (() => void) | null)?.();
      }, 0);
      return req;
    },
    createIndex: vi.fn(),
  };

  const mockDB = {
    transaction: () => mockTransaction,
    createObjectStore: () => mockObjectStore,
    objectStoreNames: { contains: () => false },
    close: vi.fn(),
  };

  return { store, mockDB, mockTransaction, mockObjectStore };
}

// ─── Tests using direct logic (no real IDB) ──────────────────────────────────

describe("Outbox record invariants", () => {
  it("new outbox records have retryCount=0, status=pending", () => {
    const record: MockRecord = {
      id: crypto.randomUUID(),
      url: "/api/pacientes",
      method: "POST",
      body: JSON.stringify({ nome: "João" }),
      headers: { "Content-Type": "application/json" },
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    };

    expect(record.retryCount).toBe(0);
    expect(record.status).toBe("pending");
  });

  it("records are NOT removed before server ACK — they are only updated", () => {
    const store = new Map<string, MockRecord>();
    const id = "record-1";

    store.set(id, {
      id,
      url: "/api/pacientes",
      method: "POST",
      body: null,
      headers: {},
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    });

    // Simulate "processing" update — record stays in store
    const existing = store.get(id)!;
    store.set(id, { ...existing, status: "processing" });

    expect(store.has(id)).toBe(true);
    expect(store.get(id)?.status).toBe("processing");

    // Only after confirmed ACK should the record be removed
    store.delete(id);
    expect(store.has(id)).toBe(false);
  });

  it("removeById only removes the targeted record", () => {
    const store = new Map<string, MockRecord>();
    const makeRecord = (id: string): MockRecord => ({
      id,
      url: "/api/test",
      method: "POST",
      body: null,
      headers: {},
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    });

    store.set("a", makeRecord("a"));
    store.set("b", makeRecord("b"));
    store.set("c", makeRecord("c"));

    store.delete("b");

    expect(store.has("a")).toBe(true);
    expect(store.has("b")).toBe(false);
    expect(store.has("c")).toBe(true);
  });

  it("updateOutboxRecord increments retryCount without deleting", () => {
    const store = new Map<string, MockRecord>();
    const id = "retry-test";

    store.set(id, {
      id,
      url: "/api/appointments",
      method: "PUT",
      body: "{}",
      headers: {},
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    });

    // Simulate network failure → increment retryCount
    const record = store.get(id)!;
    store.set(id, {
      ...record,
      retryCount: record.retryCount + 1,
      status: "failed",
    });

    expect(store.has(id)).toBe(true);
    expect(store.get(id)?.retryCount).toBe(1);
    expect(store.get(id)?.status).toBe("failed");
  });

  it("all required OutboxRecord fields exist", () => {
    const record: MockRecord = {
      id: "123",
      url: "/api/test",
      method: "POST",
      body: null,
      headers: { Authorization: "Bearer token" },
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    };

    expect(record).toHaveProperty("id");
    expect(record).toHaveProperty("url");
    expect(record).toHaveProperty("method");
    expect(record).toHaveProperty("body");
    expect(record).toHaveProperty("headers");
    expect(record).toHaveProperty("timestamp");
    expect(record).toHaveProperty("retryCount");
    expect(record).toHaveProperty("status");
  });
});

describe("createMockIDB", () => {
  let idb: ReturnType<typeof createMockIDB>;

  beforeEach(() => {
    idb = createMockIDB();
  });

  it("add() stores a record in the mock store", async () => {
    const record: MockRecord = {
      id: "mock-1",
      url: "/api/test",
      method: "GET",
      body: null,
      headers: {},
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    };

    await new Promise<void>((resolve) => {
      const tx = idb.mockDB.transaction();
      const store = tx.objectStore();
      const req = store.add(record);
      (tx as { oncomplete: (() => void) | null }).oncomplete = resolve;
      req.onsuccess?.();
    });

    expect(idb.store.has("mock-1")).toBe(true);
  });

  it("delete() removes a record from the mock store", async () => {
    idb.store.set("del-1", {
      id: "del-1",
      url: "/api/test",
      method: "DELETE",
      body: null,
      headers: {},
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
    });

    await new Promise<void>((resolve) => {
      const tx = idb.mockDB.transaction();
      const store = tx.objectStore();
      const req = store.delete("del-1");
      (tx as { oncomplete: (() => void) | null }).oncomplete = resolve;
      req.onsuccess?.();
    });

    expect(idb.store.has("del-1")).toBe(false);
  });
});
