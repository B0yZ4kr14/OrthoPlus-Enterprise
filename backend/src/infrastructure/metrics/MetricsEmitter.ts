import { Counter, Histogram, Gauge, register } from "prom-client"

class MetricsRegistry {
  private counters = new Map<string, Counter<string>>()
  private histograms = new Map<string, Histogram<string>>()
  private gauges = new Map<string, Gauge<string>>()

  counter(name: string, help: string, labelNames: string[] = []): Counter<string> {
    if (!this.counters.has(name)) {
      this.counters.set(name, new Counter({ name, help, labelNames }))
    }
    return this.counters.get(name)!
  }

  histogram(name: string, help: string, labelNames: string[] = [], buckets?: number[]): Histogram<string> {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, new Histogram({ name, help, labelNames, buckets }))
    }
    return this.histograms.get(name)!
  }

  gauge(name: string, help: string, labelNames: string[] = []): Gauge<string> {
    if (!this.gauges.has(name)) {
      this.gauges.set(name, new Gauge({ name, help, labelNames }))
    }
    return this.gauges.get(name)!
  }

  getRegister() {
    return register
  }
}

const registry = new MetricsRegistry()

export const MetricsEmitter = {
  incrementCounter(name: string, help: string, labels?: Record<string, string | number>, value = 1) {
    const labelNames = labels ? Object.keys(labels) : []
    const counter = registry.counter(name, help, labelNames)
    const formatted = labels
      ? Object.fromEntries(Object.entries(labels).map(([k, v]) => [k, String(v)]))
      : {}
    counter.inc(formatted, value)
  },

  observeHistogram(name: string, help: string, value: number, labels?: Record<string, string | number>, buckets?: number[]) {
    const labelNames = labels ? Object.keys(labels) : []
    const histogram = registry.histogram(name, help, labelNames, buckets)
    const formatted = labels
      ? Object.fromEntries(Object.entries(labels).map(([k, v]) => [k, String(v)]))
      : {}
    histogram.observe(formatted, value)
  },

  setGauge(name: string, help: string, value: number, labels?: Record<string, string | number>) {
    const labelNames = labels ? Object.keys(labels) : []
    const gauge = registry.gauge(name, help, labelNames)
    const formatted = labels
      ? Object.fromEntries(Object.entries(labels).map(([k, v]) => [k, String(v)]))
      : {}
    gauge.set(formatted, value)
  },

  getRegister() {
    return registry.getRegister()
  },
}
