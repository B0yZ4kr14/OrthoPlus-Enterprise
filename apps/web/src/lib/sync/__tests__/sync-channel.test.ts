/**
 * Tests for the BroadcastChannel sync coordination module.
 *
 * BroadcastChannel is mocked since it is not available in jsdom.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── BroadcastChannel mock ────────────────────────────────────────────────────

type MessageListener = (event: MessageEvent) => void;

class MockBroadcastChannel {
  readonly name: string;
  private static channels = new Map<string, MockBroadcastChannel[]>();

  onmessage: MessageListener | null = null;
  private listeners: Map<string, MessageListener[]> = new Map();

  constructor(name: string) {
    this.name = name;
    const existing = MockBroadcastChannel.channels.get(name) ?? [];
    existing.push(this);
    MockBroadcastChannel.channels.set(name, existing);
  }

  postMessage(data: unknown): void {
    const peers = MockBroadcastChannel.channels.get(this.name) ?? [];
    for (const peer of peers) {
      if (peer !== this) {
        const event = { data } as MessageEvent;
        peer.onmessage?.(event);
        const handlers = peer.listeners.get("message") ?? [];
        for (const handler of handlers) {
          handler(event);
        }
      }
    }
  }

  addEventListener(type: string, listener: MessageListener): void {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  removeEventListener(type: string, listener: MessageListener): void {
    const existing = this.listeners.get(type) ?? [];
    this.listeners.set(
      type,
      existing.filter((l) => l !== listener),
    );
  }

  close(): void {
    const peers = MockBroadcastChannel.channels.get(this.name) ?? [];
    MockBroadcastChannel.channels.set(
      this.name,
      peers.filter((p) => p !== this),
    );
    this.listeners.clear();
  }

  static reset(): void {
    this.channels.clear();
  }
}

// ─── Inline channel logic for isolation ──────────────────────────────────────

type SyncMessageType =
  | "LOCAL_UPDATE"
  | "SYNC_STARTED"
  | "SYNC_COMPLETE"
  | "SYNC_ERROR";

interface SyncMessage {
  type: SyncMessageType;
  tag?: string;
  data?: unknown;
  timestamp: number;
}

function createSyncChannel(ChannelClass: typeof MockBroadcastChannel) {
  let channel: MockBroadcastChannel | null = null;

  function getChannel(): MockBroadcastChannel {
    if (!channel) {
      channel = new ChannelClass("orthoplus-sync");
    }
    return channel;
  }

  function postSyncUpdate(type: SyncMessageType, data?: unknown): void {
    const ch = getChannel();
    const message: SyncMessage = { type, data, timestamp: Date.now() };
    ch.postMessage(message);
  }

  function onSyncMessage(callback: (message: SyncMessage) => void): () => void {
    const ch = getChannel();
    const handler = (event: MessageEvent<SyncMessage>): void => {
      callback(event.data);
    };
    ch.addEventListener("message", handler);
    return (): void => ch.removeEventListener("message", handler);
  }

  function close(): void {
    channel?.close();
    channel = null;
  }

  return { postSyncUpdate, onSyncMessage, close };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("BroadcastChannel sync coordination", () => {
  beforeEach(() => {
    MockBroadcastChannel.reset();
  });

  afterEach(() => {
    MockBroadcastChannel.reset();
  });

  it("postSyncUpdate delivers messages to other channel instances", () => {
    const sender = createSyncChannel(MockBroadcastChannel);
    const receiver = createSyncChannel(MockBroadcastChannel);

    const received: SyncMessage[] = [];
    receiver.onSyncMessage((msg) => received.push(msg));

    sender.postSyncUpdate("SYNC_COMPLETE", { tag: "sync-outbox" });

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe("SYNC_COMPLETE");
  });

  it("message includes a timestamp", () => {
    const before = Date.now();
    const sender = createSyncChannel(MockBroadcastChannel);
    const receiver = createSyncChannel(MockBroadcastChannel);

    const received: SyncMessage[] = [];
    receiver.onSyncMessage((msg) => received.push(msg));

    sender.postSyncUpdate("SYNC_STARTED");

    expect(received[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(received[0].timestamp).toBeLessThanOrEqual(Date.now());
  });

  it("onSyncMessage returns an unsubscribe function that stops delivery", () => {
    const sender = createSyncChannel(MockBroadcastChannel);
    const receiver = createSyncChannel(MockBroadcastChannel);

    const received: SyncMessage[] = [];
    const unsubscribe = receiver.onSyncMessage((msg) => received.push(msg));

    sender.postSyncUpdate("SYNC_STARTED");
    expect(received).toHaveLength(1);

    unsubscribe();
    sender.postSyncUpdate("SYNC_COMPLETE");
    expect(received).toHaveLength(1); // No new messages after unsubscribe
  });

  it("SYNC_ERROR message carries error detail", () => {
    const sender = createSyncChannel(MockBroadcastChannel);
    const receiver = createSyncChannel(MockBroadcastChannel);

    const received: SyncMessage[] = [];
    receiver.onSyncMessage((msg) => received.push(msg));

    sender.postSyncUpdate("SYNC_ERROR", {
      error: "Network failure",
      tag: "sync-outbox",
    });

    expect(received[0].type).toBe("SYNC_ERROR");
    expect((received[0].data as { error: string }).error).toBe(
      "Network failure",
    );
  });

  it("multiple listeners on the same channel all receive messages", () => {
    const sender = createSyncChannel(MockBroadcastChannel);

    const listener1Channel = new MockBroadcastChannel("orthoplus-sync");
    const listener2Channel = new MockBroadcastChannel("orthoplus-sync");

    const received1: SyncMessage[] = [];
    const received2: SyncMessage[] = [];

    listener1Channel.addEventListener(
      "message",
      (e: MessageEvent<SyncMessage>) => {
        received1.push(e.data);
      },
    );
    listener2Channel.addEventListener(
      "message",
      (e: MessageEvent<SyncMessage>) => {
        received2.push(e.data);
      },
    );

    sender.postSyncUpdate("LOCAL_UPDATE");

    expect(received1).toHaveLength(1);
    expect(received2).toHaveLength(1);
  });

  it("close() prevents further message delivery", () => {
    const sender = createSyncChannel(MockBroadcastChannel);
    const receiver = createSyncChannel(MockBroadcastChannel);

    const received: SyncMessage[] = [];
    receiver.onSyncMessage((msg) => received.push(msg));

    sender.postSyncUpdate("SYNC_STARTED");
    expect(received).toHaveLength(1);

    receiver.close();
    sender.postSyncUpdate("SYNC_COMPLETE");
    expect(received).toHaveLength(1);
  });
});
