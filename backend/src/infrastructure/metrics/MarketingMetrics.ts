import { Counter, Registry } from "prom-client"
import { prometheusMetrics } from "./PrometheusMetrics"

export class MarketingMetrics {
  private registry: Registry
  private campaignsCreatedTotal: Counter
  private enviosCreatedTotal: Counter
  private recallsProcessedTotal: Counter
  private triggersFiredTotal: Counter

  constructor() {
    this.registry = prometheusMetrics.getRegistry()

    this.campaignsCreatedTotal = new Counter({
      name: "marketing_campaigns_created_total",
      help: "Total number of marketing campaigns created",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })

    this.enviosCreatedTotal = new Counter({
      name: "marketing_envios_created_total",
      help: "Total number of campaign sends created",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })

    this.recallsProcessedTotal = new Counter({
      name: "marketing_recalls_processed_total",
      help: "Total number of recalls processed",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })

    this.triggersFiredTotal = new Counter({
      name: "marketing_triggers_fired_total",
      help: "Total number of campaign triggers fired",
      labelNames: ["clinic_id"],
      registers: [this.registry],
    })
  }

  incCampaignsCreated(clinicId: string): void {
    this.campaignsCreatedTotal.inc({ clinic_id: clinicId })
  }

  incEnviosCreated(clinicId: string): void {
    this.enviosCreatedTotal.inc({ clinic_id: clinicId })
  }

  incRecallsProcessed(clinicId: string): void {
    this.recallsProcessedTotal.inc({ clinic_id: clinicId })
  }

  incTriggersFired(clinicId: string): void {
    this.triggersFiredTotal.inc({ clinic_id: clinicId })
  }
}

export const marketingMetrics = new MarketingMetrics()
