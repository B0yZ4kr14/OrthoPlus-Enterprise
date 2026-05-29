import { Registry, Counter, Histogram, Gauge } from "prom-client";

export class MemoryHubMetrics {
  searchDuration: Histogram;
  indexDuration: Histogram;
  briefGenerationDuration: Histogram;
  driftDetected: Counter;
  coveragePercent: Gauge;
  documentsIndexed: Counter;

  constructor(registry: Registry) {
    this.searchDuration = new Histogram({
      name: "orthoplus_memory_hub_search_duration_seconds",
      help: "Duration of semantic search queries",
      labelNames: ["category"],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [registry],
    });

    this.indexDuration = new Histogram({
      name: "orthoplus_memory_hub_index_duration_seconds",
      help: "Duration of document indexing operations",
      labelNames: ["category"],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [registry],
    });

    this.briefGenerationDuration = new Histogram({
      name: "orthoplus_memory_hub_brief_generation_seconds",
      help: "Duration of context brief generation",
      labelNames: ["category"],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [registry],
    });

    this.driftDetected = new Counter({
      name: "orthoplus_memory_hub_drift_detected_total",
      help: "Total drift issues detected",
      labelNames: ["category", "severity"],
      registers: [registry],
    });

    this.coveragePercent = new Gauge({
      name: "orthoplus_memory_hub_coverage_percent",
      help: "Percentage of documents indexed recently",
      labelNames: ["category"],
      registers: [registry],
    });

    this.documentsIndexed = new Counter({
      name: "orthoplus_memory_hub_documents_indexed_total",
      help: "Total documents indexed",
      labelNames: ["category"],
      registers: [registry],
    });
  }
}
