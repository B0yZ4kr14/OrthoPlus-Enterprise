import { logger } from "@/infrastructure/logger";
import axios from "axios";
import cron from "node-cron";

const triggerFinanceiroJob = async (jobName: string) => {
  try {
    await axios.post("http://localhost:3005/api/financeiro/jobs/execute", {
      jobName,
    });
    logger.info(`[node-cron] Financeiro job executed: ${jobName}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(
      `[node-cron] Error executing financeiro job: ${jobName}`,
      message,
    );
  }
};

export const startFinanceiroJobsCron = () => {
  // Daily at 01:00 AM - Sync statements
  cron.schedule("0 1 * * *", () => {
    triggerFinanceiroJob("sincronizar-extratos-all");
  });

  // Intraday intelligent sweeps (Mocked placeholder timing depending on business open hours)
  cron.schedule("0 18 * * *", () => {
    triggerFinanceiroJob("sugerir-sangrias-all");
  });

  logger.info("Background workers initialized (Financeiro module).");
};
