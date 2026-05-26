import { logger } from "@/infrastructure/logger";
import { startBackupJobsCron } from "./jobs/backupJobs";
import { startCryptoJobsCron } from "./jobs/cryptoJobs";
import { startEstoqueJobsCron } from "./jobs/estoqueJobs";
import { startFinanceiroJobsCron } from "./jobs/financeiroJobs";
import { startGamificationJobs } from './jobs/gamificationJobs';
import { startAdminJobs } from './jobs/adminJobs';
import { startMarketingJobsCron } from './jobs/marketingJobs';
import { startMemoryHubDriftCron } from "./jobs/memoryHubDrift";
import { startScheduleAppointmentsCron } from "./jobs/scheduleAppointments";
import { startScheduleBiExportCron } from "./jobs/scheduleBiExport";
import { startSearchIndexScheduler } from "./searchIndexScheduler";

export const startAllWorkers = () => {
  logger.info("Starting all background workers (cron jobs)...");

  startScheduleAppointmentsCron();
  startScheduleBiExportCron();
  startBackupJobsCron();
  startEstoqueJobsCron();
  startCryptoJobsCron();
  startFinanceiroJobsCron();
  startGamificationJobs();
  startAdminJobs();
  startMarketingJobsCron();
  startMemoryHubDriftCron();
  startSearchIndexScheduler();

  logger.info("Background workers started.");
};
