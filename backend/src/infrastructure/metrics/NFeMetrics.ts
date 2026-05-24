import { Counter, Registry } from "prom-client"
import { prometheusMetrics } from "./PrometheusMetrics"

export class NFeMetrics {
  private registry: Registry
  private nfeCreatedTotal: Counter
  private nfeCancelledTotal: Counter
  private nfeErrorsTotal: Counter

  constructor() {
    this.registry = prometheusMetrics.getRegistry()

    this.nfeCreatedTotal = new Counter({
      name: "nfe_created_total",
      help: "Total number of NF-e documents created",
      labelNames: ["clinic_id", "tipo"],
      registers: [this.registry],
    })

    this.nfeCancelledTotal = new Counter({
      name: "nfe_cancelled_total",
      help: "Total number of NF-e documents cancelled",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })

    this.nfeErrorsTotal = new Counter({
      name: "nfe_errors_total",
      help: "Total number of NF-e processing errors",
      labelNames: ["clinic_id", "error_type"],
      registers: [this.registry],
    })
  }

  incCreated(clinicId: string, tipo: string): void {
    this.nfeCreatedTotal.inc({ clinic_id: clinicId, tipo })
  }

  incCancelled(clinicId: string): void {
    this.nfeCancelledTotal.inc({ clinic_id: clinicId })
  }

  incErrors(clinicId: string, errorType: string): void {
    this.nfeErrorsTotal.inc({ clinic_id: clinicId, error_type: errorType })
  }
}

export const nfeMetrics = new NFeMetrics()
