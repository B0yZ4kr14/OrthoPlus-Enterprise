/**
 * BroadcastChannel coordination layer between the main thread and the
 * Service Worker.  All cross-context sync state changes are communicated
 * through this channel.
 */

import { syncLogger } from "./sync-logger";
import { requestBackgroundSync } from "./register-sync";

const CHANNEL_NAME = "orthoplus-sync";
const DEBOUNCE_DELAY_MS = 500;

export type SyncMessageType =
  | "LOCAL_UPDATE"
  | "SYNC_STARTED"
  | "SYNC_COMPLETE"
  | "SYNC_ERROR";

export interface SyncMessage {
  type: SyncMessageType;
  tag?: string;
  data?: unknown;
  timestamp: number;
}

let channel: BroadcastChannel | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

/**
 * Post a sync update message to all contexts listening on the channel.
 */
export function postSyncUpdate(type: SyncMessageType, data?: unknown): void {
  const ch = getChannel();
  if (!ch) {
    syncLogger.warn("broadcast-unavailable", { type });
    return;
  }

  const message: SyncMessage = {
    type,
    data,
    timestamp: Date.now(),
  };

  ch.postMessage(message);
  syncLogger.debug("broadcast-posted", { type, timestamp: message.timestamp });
}

/**
 * Subscribe to sync messages from other contexts.
 * Returns an unsubscribe function.
 */
export function onSyncMessage(
  callback: (message: SyncMessage) => void,
): () => void {
  const ch = getChannel();
  if (!ch) {
    return (): void => {
      // no-op: BroadcastChannel unavailable
    };
  }

  const handler = (event: MessageEvent<SyncMessage>): void => {
    const message = event.data;

    // Trigger a debounced background sync whenever local data changes
    if (message.type === "LOCAL_UPDATE") {
      triggerDebouncedSync(message.tag ?? "sync-outbox");
    }

    callback(message);
  };

  ch.addEventListener("message", handler);

  return (): void => {
    ch.removeEventListener("message", handler);
  };
}

/**
 * Debounced sync trigger — coalesces rapid LOCAL_UPDATE messages into a
 * single background sync request.
 */
function triggerDebouncedSync(tag: string): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout((): void => {
    debounceTimer = null;
    // Fire-and-forget: errors are logged via syncLogger; the debounced trigger
    // is best-effort and should not propagate to the event listener.
    requestBackgroundSync(tag).catch((error: unknown) => {
      syncLogger.error(
        tag,
        error instanceof Error ? error : new Error(String(error)),
      );
    });
  }, DEBOUNCE_DELAY_MS);
}

/**
 * Close the BroadcastChannel and release resources.
 * Call during application teardown.
 */
export function closeSyncChannel(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (channel) {
    channel.close();
    channel = null;
  }
}
