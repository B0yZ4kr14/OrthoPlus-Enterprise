/**
 * FilesMetrics — Observabilidade de Operações de Arquivos
 *
 * Métricas exportadas:
 * - orthoplus_files_upload_total
 * - orthoplus_files_download_total
 * - orthoplus_files_deleted_total
 * - orthoplus_files_upload_duration_seconds
 * - orthoplus_files_download_duration_seconds
 * - orthoplus_files_errors_total
 */

import { Counter, Histogram, Registry } from "prom-client";

export class FilesMetrics {
  private uploadCounter: Counter;
  private downloadCounter: Counter;
  private deleteCounter: Counter;
  private errorCounter: Counter;
  private uploadDurationHistogram: Histogram;
  private downloadDurationHistogram: Histogram;

  constructor(_registry: Registry) {
    this.uploadCounter = new Counter({
      name: "orthoplus_files_upload_total",
      help: "Total number of file uploads",
      labelNames: ["clinic_id", "categoria"],
      registers: [_registry],
    });

    this.downloadCounter = new Counter({
      name: "orthoplus_files_download_total",
      help: "Total number of file downloads",
      labelNames: ["clinic_id"],
      registers: [_registry],
    });

    this.deleteCounter = new Counter({
      name: "orthoplus_files_deleted_total",
      help: "Total number of file deletions",
      labelNames: ["clinic_id"],
      registers: [_registry],
    });

    this.errorCounter = new Counter({
      name: "orthoplus_files_errors_total",
      help: "Total number of file operation errors",
      labelNames: ["clinic_id", "operation"],
      registers: [_registry],
    });

    this.uploadDurationHistogram = new Histogram({
      name: "orthoplus_files_upload_duration_seconds",
      help: "Duration of file upload operations in seconds",
      labelNames: ["clinic_id", "categoria"],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
      registers: [_registry],
    });

    this.downloadDurationHistogram = new Histogram({
      name: "orthoplus_files_download_duration_seconds",
      help: "Duration of file download operations in seconds",
      labelNames: ["clinic_id"],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [_registry],
    });
  }

  recordUpload(clinicId: string, categoria: string, durationMs: number): void {
    this.uploadCounter.inc({ clinic_id: clinicId, categoria });
    this.uploadDurationHistogram.observe(
      { clinic_id: clinicId, categoria },
      durationMs / 1000,
    );
  }

  recordDownload(clinicId: string, durationMs: number): void {
    this.downloadCounter.inc({ clinic_id: clinicId });
    this.downloadDurationHistogram.observe(
      { clinic_id: clinicId },
      durationMs / 1000,
    );
  }

  recordDelete(clinicId: string): void {
    this.deleteCounter.inc({ clinic_id: clinicId });
  }

  recordError(clinicId: string, operation: string): void {
    this.errorCounter.inc({ clinic_id: clinicId, operation });
  }
}
