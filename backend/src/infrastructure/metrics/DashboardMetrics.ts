import { Counter, Histogram, Registry } from "prom-client"
import { prometheusMetrics } from "./PrometheusMetrics"

export class DashboardMetrics {
  private registry: Registry
  private dashboardRequestsTotal: Counter
  private dashboardRequestDuration: Histogram

  constructor() {
    this.registry = prometheusMetrics.getRegistry()

    this.dashboardRequestsTotal = new Counter({
      name: "dashboard_requests_total",
      help: "Total number of dashboard requests",
      labelNames: ["clinic_id", "status"],
      registers: [this.registry],
    })

    this.dashboardRequestDuration = new Histogram({
      name: "dashboard_request_duration_ms",
      help: "Duration of dashboard requests in milliseconds",
      labelNames: ["clinic_id"],
      buckets: [50, 100, 250, 500, 1000, 2000],
      registers: [this.registry],
    })
  }

  incRequests(clinicId: string, status: string): void {
    this.dashboardRequestsTotal.inc({ clinic_id: clinicId, status })
  }

  observeDuration(clinicId: string, durationMs: number): void {
    this.dashboardRequestDuration.observe({ clinic_id: clinicId }, durationMs)
  }
}

export const dashboardMetrics = new DashboardMetrics()
