/**
 * Background Sync API type declarations.
 * The Background Sync API is not yet in the standard TypeScript DOM lib,
 * so we declare it here for type-safe Service Worker development.
 */

interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

interface SyncEvent extends ExtendableEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

declare global {
  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
  }

  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }
}

export {};
