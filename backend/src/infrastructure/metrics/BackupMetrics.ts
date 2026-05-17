/**
 * BackupMetrics — Observabilidade de Backups por Categoria
 * 
 * Métricas exportadas:
 * - orthoplus_backup_duration_seconds
 * - orthoplus_backup_size_bytes
 * - orthoplus_backup_success_total
 * - orthoplus_backup_failure_total
 */

import { Counter, Histogram, Gauge, Registry } from "prom-client";

export class BackupMetrics {
  private durationHistogram: Histogram;
  private sizeGauge: Gauge;
  private successCounter: Counter;
  private failureCounter: Counter;

  constructor(_registry: Registry) {
    this.durationHistogram = new Histogram({
      name: "orthoplus_backup_duration_seconds",
      help: "Duration of backup operations in seconds",
      labelNames: ["category"],
      buckets: [0.5, 1, 2, 5, 10, 30, 60, 120, 300],
      registers: [_registry],
    });

    this.sizeGauge = new Gauge({
      name: "orthoplus_backup_size_bytes",
      help: "Size of the last backup in bytes",
      labelNames: ["category"],
      registers: [_registry],
    });

    this.successCounter = new Counter({
      name: "orthoplus_backup_success_total",
      help: "Total number of successful backups",
      labelNames: ["category"],
      registers: [_registry],
    });

    this.failureCounter = new Counter({
      name: "orthoplus_backup_failure_total",
      help: "Total number of failed backups",
      labelNames: ["category"],
      registers: [_registry],
    });
  }

  recordSuccess(category: string, durationMs: number, sizeBytes: number): void {
    this.durationHistogram.observe({ category }, durationMs / 1000);
    this.sizeGauge.set({ category }, sizeBytes);
    this.successCounter.inc({ category });
  }

  recordFailure(category: string): void {
    this.failureCounter.inc({ category });
  }
}
