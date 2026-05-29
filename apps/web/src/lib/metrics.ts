/**
 * Frontend metrics emitter for EP-4 compliance.
 * Tracks hook renders and component lifecycle events.
 */
export interface HookMetric {
  hookName: string;
  page: string;
  timestamp: number;
}

class FrontendMetrics {
  private buffer: HookMetric[] = [];
  private flushInterval: number | null = null;
  private readonly endpoint = "/api/metrics/frontend";

  constructor() {
    if (typeof window !== "undefined") {
      // Flush every 30 seconds
      this.flushInterval = window.setInterval(() => this.flush(), 30000);
      // Flush on page unload
      window.addEventListener("beforeunload", () => this.flush());
    }
  }

  recordHookRender(hookName: string, page: string) {
    this.buffer.push({ hookName, page, timestamp: Date.now() });
    // Flush immediately if buffer reaches 50
    if (this.buffer.length >= 50) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.buffer.length);
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: batch }),
        keepalive: true,
      });
    } catch {
      // Silently drop metrics on network failure
    }
  }

  destroy() {
    if (this.flushInterval !== null) {
      clearInterval(this.flushInterval);
    }
  }
}

export const frontendMetrics = new FrontendMetrics();
