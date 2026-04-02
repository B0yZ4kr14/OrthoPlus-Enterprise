/**
 * Service Worker and Background Sync registration utility.
 *
 * Registers the Service Worker and provides `requestBackgroundSync()`.
 * Falls back to an immediate network request when the Background Sync API
 * is not supported (graceful degradation).
 */

import { syncLogger } from "./sync-logger";

const SW_PATH = "/sw.js";
const REGISTRATION_TIMEOUT_MS = 10_000;

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the Service Worker.
 * Safe to call multiple times — returns the cached registration on subsequent calls.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    syncLogger.warn("sw-register-skipped", {
      reason: "serviceWorker not supported",
    });
    return null;
  }

  if (swRegistration) {
    return swRegistration;
  }

  try {
    const registration = await Promise.race([
      navigator.serviceWorker.register(SW_PATH, { scope: "/" }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("SW registration timed out")),
          REGISTRATION_TIMEOUT_MS,
        ),
      ),
    ]);

    swRegistration = registration;
    syncLogger.log("info", "sw-registered", { scope: registration.scope });
    return registration;
  } catch (error) {
    syncLogger.error(
      "sw-register",
      error instanceof Error ? error : new Error(String(error)),
    );
    return null;
  }
}

/**
 * Check whether the Background Sync API is available in this browser.
 */
export function isSyncSupported(): boolean {
  return "serviceWorker" in navigator && "SyncManager" in window;
}

/**
 * Request a background sync for the given tag.
 *
 * If the Background Sync API is not supported, `fallback` is called immediately
 * so the caller can attempt a direct network request instead.
 *
 * @param tag     — Sync tag name (e.g. 'sync-outbox')
 * @param fallback — Optional async function executed when Background Sync is unavailable
 */
export async function requestBackgroundSync(
  tag: string,
  fallback?: () => Promise<void>,
): Promise<void> {
  if (!isSyncSupported()) {
    syncLogger.warn("sync-api-unavailable", { tag, action: "fallback" });
    if (fallback) {
      await fallback();
    }
    return;
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    syncLogger.warn("sync-no-registration", { tag, action: "fallback" });
    if (fallback) {
      await fallback();
    }
    return;
  }

  try {
    await registration.sync.register(tag);
    syncLogger.log("info", "sync-registered", { tag });
  } catch (error) {
    syncLogger.error(
      tag,
      error instanceof Error ? error : new Error(String(error)),
    );
    if (fallback) {
      await fallback();
    }
  }
}
