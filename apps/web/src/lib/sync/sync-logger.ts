/**
 * Structured observability utilities for the Background Sync subsystem.
 * All log entries are JSON-formatted for easy ingestion by log aggregators.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

function logEntry(
  level: LogLevel,
  event: string,
  details: Record<string, unknown>,
): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      component: "background-sync",
      level,
      event,
      ...details,
    }),
  );
}

export const syncLogger = {
  log(level: LogLevel, event: string, details: Record<string, unknown>): void {
    logEntry(level, event, details);
  },

  start(tag: string): void {
    logEntry("info", "sync-start", { tag });
  },

  complete(tag: string, duration: number): void {
    logEntry("info", "sync-complete", { tag, duration });
  },

  error(tag: string, error: Error): void {
    logEntry("error", "sync-error", { tag, error: error.message });
  },

  debug(event: string, details: Record<string, unknown>): void {
    logEntry("debug", event, details);
  },

  warn(event: string, details: Record<string, unknown>): void {
    logEntry("warn", event, details);
  },
};
