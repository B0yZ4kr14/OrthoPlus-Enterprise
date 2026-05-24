import { Histogram, Counter, Registry } from "prom-client"
import { prometheusMetrics } from "./PrometheusMetrics"

export class TeleodontoMetrics {
  private registry: Registry
  private teleconsultaCreateDuration: Histogram
  private teleconsultaSessionDuration: Histogram
  private teleconsultasTotal: Counter
  private sessionsStartedTotal: Counter
  private sessionsEndedTotal: Counter
  private prescriptionsTotal: Counter

  constructor() {
    this.registry = prometheusMetrics.getRegistry()

    this.teleconsultaCreateDuration = new Histogram({
      name: "teleconsulta_create_duration_ms",
      help: "Duration of teleconsulta creation in milliseconds",
      labelNames: ["clinic_id"],
      buckets: [50, 100, 250, 500, 1000, 2000, 5000],
      registers: [this.registry],
    })

    this.teleconsultaSessionDuration = new Histogram({
      name: "teleconsulta_session_duration_seconds",
      help: "Duration of teleconsulta sessions in seconds",
      labelNames: ["clinic_id", "status"],
      buckets: [60, 300, 600, 1800, 3600],
      registers: [this.registry],
    })

    this.teleconsultasTotal = new Counter({
      name: "teleconsultas_created_total",
      help: "Total number of teleconsultas created",
      labelNames: ["clinic_id", "status"],
      registers: [this.registry],
    })

    this.sessionsStartedTotal = new Counter({
      name: "teleconsulta_sessions_started_total",
      help: "Total number of teleconsulta sessions started",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })

    this.sessionsEndedTotal = new Counter({
      name: "teleconsulta_sessions_ended_total",
      help: "Total number of teleconsulta sessions ended",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })

    this.prescriptionsTotal = new Counter({
      name: "teleconsulta_prescriptions_total",
      help: "Total number of prescriptions added to teleconsultas",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })
  }

  observeCreateDuration(clinicId: string, durationMs: number): void {
    this.teleconsultaCreateDuration.observe({ clinic_id: clinicId }, durationMs)
  }

  observeSessionDuration(clinicId: string, status: string, durationSeconds: number): void {
    this.teleconsultaSessionDuration.observe({ clinic_id: clinicId, status }, durationSeconds)
  }

  incTeleconsultasTotal(clinicId: string, status: string): void {
    this.teleconsultasTotal.inc({ clinic_id: clinicId, status })
  }

  incSessionsStarted(clinicId: string): void {
    this.sessionsStartedTotal.inc({ clinic_id: clinicId })
  }

  incSessionsEnded(clinicId: string): void {
    this.sessionsEndedTotal.inc({ clinic_id: clinicId })
  }

  incPrescriptions(clinicId: string): void {
    this.prescriptionsTotal.inc({ clinic_id: clinicId })
  }
}

export const teleodontoMetrics = new TeleodontoMetrics()
