import { z } from "zod";
import { MasterDatabaseManager } from "@/modules/database_admin/infrastructure/MasterDatabaseManager";
import { circuitBreakerRegistry } from "@/infrastructure/database/CategoryCircuitBreaker";
import { BackupSchedulerService } from "@/modules/database_admin/infrastructure/BackupSchedulerService";
import { prometheusMetrics } from "@/infrastructure/metrics/PrometheusMetrics";
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector";
import { Errors } from "@/middleware/errorHandler";

const masterManager = new MasterDatabaseManager();
const backupService = new BackupSchedulerService();
const metricsCollector = getMetricsCollector(prometheusMetrics.getRegistry());

export class MasterDatabaseControllerService {
  async getCategories() {
    return masterManager.getCategories();
  }

  async getMasterHealth() {
    const health = await masterManager.getHealth();
    for (const cat of health.categories) {
      metricsCollector.database.recordHealthCheck(
        cat.category,
        cat.latencyMs,
        cat.status,
      );
    }
    return health;
  }

  async getMasterStats() {
    const stats = await masterManager.getStats();
    for (const cat of stats.categories) {
      metricsCollector.database.recordStats(
        cat.category,
        cat.tableCount,
        cat.sizeBytes,
      );
    }
    return stats;
  }

  async crossQuery(body: unknown) {
    const schema = z.object({
      query: z.string().min(1),
      schemas: z.array(z.string()).min(1),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw Errors.validation(
        `Invalid input: ${JSON.stringify(parsed.error.flatten())}`,
      );
    }

    return masterManager.crossQuery(parsed.data.query, parsed.data.schemas);
  }

  getCircuitMetrics() {
    const metrics = circuitBreakerRegistry.getAllMetrics();
    metricsCollector.circuitBreaker.collect();
    return { metrics };
  }

  resetCircuit(category?: string) {
    if (category) {
      circuitBreakerRegistry.resetCategory(category);
      return { message: `Circuit breaker reset for ${category}` };
    }
    circuitBreakerRegistry.resetAll();
    return { message: "All circuit breakers reset" };
  }

  async getBackupStatus() {
    const status = await backupService.getAllBackupStatus();
    return { categories: status };
  }

  async executeBackup(category: string, body: { compress?: boolean }) {
    const result = await backupService.executeBackup(category, {
      compress: body.compress,
    });

    if (result.success) {
      metricsCollector.backup.recordSuccess(
        category,
        result.durationMs,
        result.sizeBytes,
      );
    } else {
      metricsCollector.backup.recordFailure(category);
    }

    return result;
  }
}
