/**
 * CircuitBreakerMetrics — Observabilidade do Circuit Breaker por Categoria
 * 
 * Métricas exportadas:
 * - orthoplus_circuit_breaker_state (0=CLOSED, 1=HALF_OPEN, 2=OPEN)
 * - orthoplus_circuit_breaker_failures_total
 * - orthoplus_circuit_breaker_rejected_calls_total
 * - orthoplus_circuit_breaker_latency_ms
 */

import { Gauge, Counter, Histogram, Registry } from "prom-client";
import { circuitBreakerRegistry } from "@/infrastructure/database/CategoryCircuitBreaker";

export class CircuitBreakerMetrics {
  private stateGauge: Gauge;
  private failuresCounter: Counter;
  private rejectedCounter: Counter;
  private latencyHistogram: Histogram;

  constructor(_registry: Registry) {
    this.stateGauge = new Gauge({
      name: "orthoplus_circuit_breaker_state",
      help: "Circuit breaker state: 0=CLOSED, 1=HALF_OPEN, 2=OPEN",
      labelNames: ["category"],
      registers: [_registry],
    });

    this.failuresCounter = new Counter({
      name: "orthoplus_circuit_breaker_failures_total",
      help: "Total number of circuit breaker failures",
      labelNames: ["category"],
      registers: [_registry],
    });

    this.rejectedCounter = new Counter({
      name: "orthoplus_circuit_breaker_rejected_calls_total",
      help: "Total number of rejected calls due to open circuit",
      labelNames: ["category"],
      registers: [_registry],
    });

    this.latencyHistogram = new Histogram({
      name: "orthoplus_circuit_breaker_latency_ms",
      help: "Latency of circuit breaker protected calls in ms",
      labelNames: ["category"],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [_registry],
    });
  }

  collect(): void {
    const metrics = circuitBreakerRegistry.getAllMetrics();
    for (const m of metrics) {
      const stateValue = m.state === "CLOSED" ? 0 : m.state === "HALF_OPEN" ? 1 : 2;
      this.stateGauge.set({ category: m.category }, stateValue);
      this.failuresCounter.inc({ category: m.category }, 0); // Ensure label exists
      this.rejectedCounter.inc({ category: m.category }, 0);
    }
  }

  recordFailure(category: string): void {
    this.failuresCounter.inc({ category });
  }

  recordRejection(category: string): void {
    this.rejectedCounter.inc({ category });
  }

  recordLatency(category: string, ms: number): void {
    this.latencyHistogram.observe({ category }, ms);
  }
}
