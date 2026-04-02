/**
 * OrthoPlus Service Worker
 * Handles Background Sync, fetch interception, and lifecycle events.
 *
 * This file is served from /sw.js (copied from public/) and runs in the
 * Service Worker global scope (ServiceWorkerGlobalScope).
 *
 * IMPORTANT: waitUntil() must always receive a real Promise — never
 * undefined or a function reference.  Every handler in this file uses
 * named async functions with explicit return statements so that
 * TypeScript / linters can verify the return type at build time.
 */

'use strict';

const CACHE_NAME = 'orthoplus-v1';
const SYNC_CHANNEL_NAME = 'orthoplus-sync';
const OUTBOX_DB_NAME = 'orthoplus-outbox';
const OUTBOX_STORE = 'outbox';
const SYNC_TIMEOUT_MS = 30_000;
const MAX_RETRY_COUNT = 5;

// ─── Structured logger ──────────────────────────────────────────────────────

const syncLogger = {
  log(level, event, details) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        component: 'sw-background-sync',
        level,
        event,
        ...details,
      }),
    );
  },
  start(tag) { this.log('info', 'sync-start', { tag }); },
  complete(tag, duration) { this.log('info', 'sync-complete', { tag, duration }); },
  error(tag, error) { this.log('error', 'sync-error', { tag, error: error.message }); },
};

// ─── assertPromise ──────────────────────────────────────────────────────────

/**
 * Runtime guard: throw if `value` is not a Promise.
 * Prevents silent `waitUntil(undefined)` bugs.
 *
 * @param {unknown} value
 * @param {string} context
 * @returns {Promise<unknown>}
 */
function assertPromise(value, context) {
  if (
    value === null ||
    value === undefined ||
    typeof value !== 'object' ||
    typeof value.then !== 'function'
  ) {
    throw new TypeError(
      `[SW] assertPromise: expected a Promise in "${context}", got ${typeof value}`,
    );
  }
  return value;
}

// ─── withTimeout ────────────────────────────────────────────────────────────

/**
 * Wrap a Promise with a timeout.  If the wrapped promise does not settle
 * within `ms` milliseconds the returned promise rejects.
 *
 * @param {Promise<unknown>} promise
 * @param {number} ms
 * @param {string} label
 * @returns {Promise<unknown>}
 */
function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`[SW] Timeout after ${ms}ms: ${label}`)),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
}

// ─── IndexedDB outbox helpers ────────────────────────────────────────────────

/** @returns {Promise<IDBDatabase>} */
function openOutboxDB() {
  return new Promise((resolve, reject) => {
    const request = self.indexedDB.open(OUTBOX_DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/** @returns {Promise<Array<{id:string,url:string,method:string,body:string|null,headers:Record<string,string>,timestamp:number,retryCount:number,status:string}>>} */
async function getAllPendingRecords() {
  const db = await openOutboxDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly');
    const store = tx.objectStore(OUTBOX_STORE);
    const request = store.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Update a record in the outbox.  Does NOT delete — deletion only after ACK.
 *
 * @param {string} id
 * @param {Partial<{status:string, retryCount:number}>} patch
 * @returns {Promise<void>}
 */
async function updateRecord(id, patch) {
  const db = await openOutboxDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    const getReq = store.get(id);

    getReq.onsuccess = (event) => {
      const existing = event.target.result;
      if (!existing) {
        reject(new Error(`[SW] Outbox record ${id} not found`));
        return;
      }
      store.put({ ...existing, ...patch });
    };

    getReq.onerror = (event) => reject(event.target.error);

    tx.oncomplete = () => {
      resolve();
      db.close();
    };

    tx.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Delete a record from the outbox AFTER confirmed server ACK.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
async function deleteRecord(id) {
  const db = await openOutboxDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
    tx.oncomplete = () => db.close();
  });
}

// ─── Exponential backoff ─────────────────────────────────────────────────────

/**
 * Calculate exponential back-off delay (capped at 32 s).
 *
 * @param {number} retryCount
 * @returns {number} delay in milliseconds
 */
function backoffDelay(retryCount) {
  return Math.min(1_000 * Math.pow(2, retryCount), 32_000);
}

// ─── BroadcastChannel ────────────────────────────────────────────────────────

/**
 * Post a status message to the main thread.
 *
 * @param {'SYNC_STARTED'|'SYNC_COMPLETE'|'SYNC_ERROR'} type
 * @param {unknown} [data]
 */
function broadcast(type, data) {
  try {
    const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
    ch.postMessage({ type, data, timestamp: Date.now() });
    ch.close();
  } catch (err) {
    console.warn('[SW] BroadcastChannel unavailable:', err);
  }
}

// ─── Outbox processor ────────────────────────────────────────────────────────

/**
 * Process all pending outbox records.
 * Records are only removed after a confirmed server 2xx response.
 *
 * @returns {Promise<void>}
 */
async function processOutbox() {
  const records = await getAllPendingRecords();
  const pending = records.filter((r) => r.status === 'pending' || r.status === 'failed');

  if (pending.length === 0) {
    syncLogger.log('info', 'outbox-empty', {});
    return;
  }

  syncLogger.log('info', 'outbox-processing', { count: pending.length });

  for (const record of pending) {
    if (record.retryCount >= MAX_RETRY_COUNT) {
      syncLogger.log('warn', 'outbox-max-retries', { id: record.id, url: record.url });
      await updateRecord(record.id, { status: 'failed' });
      continue;
    }

    // Mark as processing so other sync events skip it
    await updateRecord(record.id, { status: 'processing' });

    try {
      const init = {
        method: record.method,
        headers: record.headers,
        body: record.body ?? undefined,
      };

      const response = await fetch(record.url, init);

      if (response.ok) {
        // Server confirmed — safe to delete
        await deleteRecord(record.id);
        syncLogger.log('info', 'outbox-record-synced', { id: record.id, url: record.url });
      } else {
        const delay = backoffDelay(record.retryCount);
        syncLogger.log('warn', 'outbox-record-retry', {
          id: record.id,
          status: response.status,
          delay,
        });
        await updateRecord(record.id, {
          status: 'pending',
          retryCount: record.retryCount + 1,
        });
      }
    } catch (fetchError) {
      syncLogger.error(record.id, fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
      await updateRecord(record.id, {
        status: 'pending',
        retryCount: record.retryCount + 1,
      });
      // Re-throw to let the sync manager retry the entire tag
      throw fetchError;
    }
  }
}

// ─── Named sync handler ──────────────────────────────────────────────────────

/**
 * Route a sync tag to its handler.  Always returns a Promise<void>.
 *
 * @param {string} tag
 * @returns {Promise<void>}
 */
async function handleSync(tag) {
  switch (tag) {
    case 'sync-outbox':
      return processOutbox();
    default:
      console.warn(`[SW] Unknown sync tag: ${tag}`);
      return Promise.resolve();
  }
}

// ─── createSyncHandler ───────────────────────────────────────────────────────

/**
 * Wraps the core sync handler with logging, timing, and promise validation.
 *
 * @param {string} tag
 * @returns {Promise<void>}
 */
async function createSyncHandler(tag) {
  syncLogger.start(tag);
  broadcast('SYNC_STARTED', { tag });
  const startTime = Date.now();

  try {
    await handleSync(tag);
    const duration = Date.now() - startTime;
    syncLogger.complete(tag, duration);
    broadcast('SYNC_COMPLETE', { tag, duration });
  } catch (error) {
    syncLogger.error(tag, error instanceof Error ? error : new Error(String(error)));
    broadcast('SYNC_ERROR', { tag, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

// ─── Lifecycle: install ──────────────────────────────────────────────────────

async function onInstall() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(['/']);
  syncLogger.log('info', 'sw-installed', { cache: CACHE_NAME });
  await self.skipWaiting();
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    assertPromise(onInstall(), 'install handler'),
  );
});

// ─── Lifecycle: activate ─────────────────────────────────────────────────────

async function onActivate() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key !== CACHE_NAME)
      .map((key) => caches.delete(key)),
  );
  syncLogger.log('info', 'sw-activated', { cache: CACHE_NAME });
  await self.clients.claim();
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    assertPromise(onActivate(), 'activate handler'),
  );
});

// ─── Background Sync ─────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  const syncPromise = createSyncHandler(event.tag);
  event.waitUntil(
    assertPromise(
      withTimeout(syncPromise, SYNC_TIMEOUT_MS, `sync:${event.tag}`),
      `sync handler for ${event.tag}`,
    ),
  );
});

// ─── Fetch interception ──────────────────────────────────────────────────────

async function networkFirstFetch(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirstFetch(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for API requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/rest/')) {
    event.respondWith(
      assertPromise(
        networkFirstFetch(request),
        `fetch network-first: ${url.pathname}`,
      ),
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    assertPromise(
      cacheFirstFetch(request),
      `fetch cache-first: ${url.pathname}`,
    ),
  );
});
