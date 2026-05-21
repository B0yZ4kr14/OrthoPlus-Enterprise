import { Registry, Counter, Histogram, Gauge } from "prom-client"

/**
 * Métricas Prometheus para o módulo IA Radiografia
 * Segue padrão orthoplus_* com label category="pep"
 */
export class IARadiografiaMetrics {
  uploadsTotal: Counter
  analysisDuration: Histogram
  reviewsTotal: Counter
  consentRevocationsTotal: Counter
  activeAnalyses: Gauge
  analysisErrors: Counter

  constructor(registry: Registry) {
    this.uploadsTotal = new Counter({
      name: "orthoplus_ia_radiografia_uploads_total",
      help: "Total de uploads de radiografias para análise por IA",
      labelNames: ["category", "tipo_radiografia", "status"],
      registers: [registry],
    })

    this.analysisDuration = new Histogram({
      name: "orthoplus_ia_radiografia_analysis_duration_seconds",
      help: "Duração do processamento de análise IA em segundos",
      labelNames: ["category", "modelo"],
      buckets: [1, 5, 10, 15, 20, 30, 60],
      registers: [registry],
    })

    this.reviewsTotal = new Counter({
      name: "orthoplus_ia_radiografia_reviews_total",
      help: "Total de revisões realizadas por dentistas",
      labelNames: ["category"],
      registers: [registry],
    })

    this.consentRevocationsTotal = new Counter({
      name: "orthoplus_ia_radiografia_consent_revocations_total",
      help: "Total de revogações de consentimento LGPD",
      labelNames: ["category"],
      registers: [registry],
    })

    this.activeAnalyses = new Gauge({
      name: "orthoplus_ia_radiografia_active_analyses",
      help: "Número de análises em processamento no momento",
      labelNames: ["category", "status"],
      registers: [registry],
    })

    this.analysisErrors = new Counter({
      name: "orthoplus_ia_radiografia_analysis_errors_total",
      help: "Total de erros no processamento de análise IA",
      labelNames: ["category", "error_type"],
      registers: [registry],
    })
  }
}
