/**
 * DatabaseCategoryMetrics — Observabilidade de Categorias de BD
 * 
 * Métricas exportadas:
 * - orthoplus_db_category_latency_ms
 * - orthoplus_db_category_tables
 * - orthoplus_db_category_size_bytes
 * - orthoplus_db_category_health (0=down, 1=degraded, 2=healthy)
 */

import { Gauge, Histogram, Registry } from "prom-client";

export class DatabaseCategoryMetrics {
  private latencyHistogram: Histogram;
  private tablesGauge: Gauge;
  private sizeGauge: Gauge;
  private healthGauge: Gauge;

  constructor(_registry: Registry) {
    this.latencyHistogram = new Histogram({
      name: "orthoplus_db_category_latency_ms",
      help: "Database health check latency per category in ms",
      labelNames: ["category"],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [_registry],
    });

    this.tablesGauge = new Gauge({
      name: "orthoplus_db_category_tables",
      help: "Number of tables per database category",
      labelNames: ["category"],
      registers: [_registry],
    });

    this.sizeGauge = new Gauge({
      name: "orthoplus_db_category_size_bytes",
      help: "Total size per database category in bytes",
      labelNames: ["category"],
      registers: [_registry],
    });

    this.healthGauge = new Gauge({
      name: "orthoplus_db_category_health",
      help: "Health status: 0=down, 1=degraded, 2=healthy",
      labelNames: ["category"],
      registers: [_registry],
    });
  }

  recordHealthCheck(category: string, latencyMs: number, status: "healthy" | "degraded" | "down" | "circuit_open"): void {
    this.latencyHistogram.observe({ category }, latencyMs);
    const healthValue = status === "healthy" ? 2 : status === "degraded" ? 1 : 0;
    this.healthGauge.set({ category }, healthValue);
  }

  recordStats(category: string, tableCount: number, sizeBytes: number): void {
    this.tablesGauge.set({ category }, tableCount);
    this.sizeGauge.set({ category }, sizeBytes);
  }
}
