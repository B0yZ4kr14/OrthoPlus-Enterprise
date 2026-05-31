import { logger } from "@/infrastructure/logger";
import { spawn } from "child_process";
import path from "path";

const CRON_EXPRESSION = process.env.MEMORY_HUB_DRIFT_SCAN_CRON || "0 2 * * *";
let driftTimeout: NodeJS.Timeout | null = null;
let driftInterval: NodeJS.Timeout | null = null;

function parseCronExpression(cron: string): { hour: number; minute: number } {
  const parts = cron.split(" ");
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${cron}`);
  }
  return {
    minute: parseInt(parts[0], 10),
    hour: parseInt(parts[1], 10),
  };
}

function getMsUntilNextRun(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0,
  );
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function runDriftScan(): void {
  logger.info("[MemoryHubDrift] Starting scheduled drift scan");
  const workerPath = path.join(
    __dirname,
    "../../modules/memory_hub/workers/driftScanWorker.ts",
  );
  const child = spawn("npx", ["tsx", workerPath], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    if (code === 0) {
      logger.info("[MemoryHubDrift] Drift scan completed successfully");
    } else {
      logger.error(`[MemoryHubDrift] Drift scan exited with code ${code}`);
    }
  });
}

export function startMemoryHubDriftCron(): void {
  if (process.env.MEMORY_HUB_ENABLED === "false") {
    logger.info("[MemoryHubDrift] Disabled via MEMORY_HUB_ENABLED=false");
    return;
  }

  const { hour, minute } = parseCronExpression(CRON_EXPRESSION);
  const msUntil = getMsUntilNextRun(hour, minute);

  logger.info(
    `[MemoryHubDrift] Scheduled drift scan at ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} (in ${Math.round(msUntil / 1000 / 60)} minutes)`,
  );

  driftTimeout = setTimeout(() => {
    runDriftScan();
    driftInterval = setInterval(runDriftScan, 24 * 60 * 60 * 1000);
  }, msUntil);
}

export function stopMemoryHubDrift(): void {
  if (driftTimeout) {
    clearTimeout(driftTimeout);
    driftTimeout = null;
  }
  if (driftInterval) {
    clearInterval(driftInterval);
    driftInterval = null;
  }
  logger.info("[MemoryHubDrift] Stopped drift scan scheduler");
}
