/**
 * MetricsCollector — Agregador de métricas customizadas OrthoPlus
 * 
 * Integra:
 * - CircuitBreakerMetrics
 * - BackupMetrics
 * - DatabaseCategoryMetrics
 * 
 * Uso: Chamar .record*() nos controllers/services para emitir métricas.
 */

import { Registry } from "prom-client";
import { CircuitBreakerMetrics } from "./CircuitBreakerMetrics";
import { BackupMetrics } from "./BackupMetrics";
import { DatabaseCategoryMetrics } from "./DatabaseCategoryMetrics";

class MetricsCollector {
  circuitBreaker: CircuitBreakerMetrics;
  backup: BackupMetrics;
  database: DatabaseCategoryMetrics;

  constructor(registry: Registry) {
    this.circuitBreaker = new CircuitBreakerMetrics(registry);
    this.backup = new BackupMetrics(registry);
    this.database = new DatabaseCategoryMetrics(registry);
  }
}

let instance: MetricsCollector | null = null;

export function getMetricsCollector(registry: Registry): MetricsCollector {
  if (!instance) {
    instance = new MetricsCollector(registry);
  }
  return instance;
}
