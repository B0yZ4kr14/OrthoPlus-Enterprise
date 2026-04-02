import { logger } from "@/infrastructure/logger";
import axios from "axios";
import cron from "node-cron";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3005";

const triggerMarketingAction = async (endpoint: string) => {
  try {
    await axios.post(`${BASE_URL}/api/marketing/${endpoint}`);
    logger.info(`[node-cron] Marketing action executed: ${endpoint}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(
      `[node-cron] Error executing marketing action: ${endpoint}`,
      message,
    );
  }
};

export const startMarketingJobsCron = () => {
  // Daily at 08:00 AM - Process campaign triggers (birthday greetings, post-visit follow-ups)
  cron.schedule("0 8 * * *", () => {
    triggerMarketingAction("triggers/process");
  });

  // Daily at 09:00 AM - Process pending recalls
  cron.schedule("0 9 * * *", () => {
    triggerMarketingAction("recalls/process");
  });

  logger.info("Background workers initialized (Marketing module).");
};
