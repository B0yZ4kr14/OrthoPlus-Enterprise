/**
 * IndexedDB-backed outbox for offline-first Background Sync.
 *
 * Records are written to the outbox when a network operation is attempted
 * offline.  They are only removed AFTER the server confirms receipt —
 * never before.
 */

const DB_NAME = "orthoplus-outbox";
const DB_VERSION = 1;
const STORE_NAME = "outbox";

export type OutboxStatus = "pending" | "processing" | "failed";

export interface OutboxRecord {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  timestamp: number;
  retryCount: number;
  status: OutboxStatus;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = (event: Event): void => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event): void => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Add an operation to the outbox.
 * The record is persisted locally and will be retried by the Service Worker
 * once connectivity is restored.
 */
export async function addToOutbox(
  operation: Omit<OutboxRecord, "id" | "timestamp" | "retryCount" | "status">,
): Promise<OutboxRecord> {
  const db = await openDB();
  const record: OutboxRecord = {
    ...operation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
    status: "pending",
  };

  return new Promise<OutboxRecord>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);

    request.onsuccess = (): void => {
      resolve(record);
    };

    request.onerror = (event: Event): void => {
      reject((event.target as IDBRequest).error);
    };

    tx.oncomplete = (): void => {
      db.close();
    };
  });
}

/**
 * Retrieve all outbox records.
 */
export async function getAllOutboxRecords(): Promise<OutboxRecord[]> {
  const db = await openDB();

  return new Promise<OutboxRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event: Event): void => {
      resolve((event.target as IDBRequest<OutboxRecord[]>).result);
    };

    request.onerror = (event: Event): void => {
      reject((event.target as IDBRequest).error);
    };

    tx.oncomplete = (): void => {
      db.close();
    };
  });
}

/**
 * Remove a record by id.
 * IMPORTANT: call this only after the server has acknowledged the operation.
 */
export async function removeById(id: string): Promise<void> {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = (): void => {
      resolve();
    };

    request.onerror = (event: Event): void => {
      reject((event.target as IDBRequest).error);
    };

    tx.oncomplete = (): void => {
      db.close();
    };
  });
}

/**
 * Update the status and retryCount of an existing record.
 * Does NOT remove the record — deletion only happens after confirmed ACK.
 */
export async function updateOutboxRecord(
  id: string,
  patch: Partial<Pick<OutboxRecord, "status" | "retryCount">>,
): Promise<void> {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = (event: Event): void => {
      const existing = (event.target as IDBRequest<OutboxRecord>).result;
      if (!existing) {
        reject(new Error(`Outbox record ${id} not found`));
        return;
      }
      const updated: OutboxRecord = { ...existing, ...patch };
      const putReq = store.put(updated);
      // Resolve is deferred to tx.oncomplete so the write is fully committed.
      putReq.onerror = (ev: Event): void => {
        reject((ev.target as IDBRequest).error);
      };
    };

    getReq.onerror = (event: Event): void => {
      reject((event.target as IDBRequest).error);
    };

    tx.oncomplete = (): void => {
      resolve();
      db.close();
    };

    tx.onerror = (event: Event): void => {
      reject((event.target as IDBTransaction).error);
    };
  });
}
