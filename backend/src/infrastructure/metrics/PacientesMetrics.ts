import { Histogram, Gauge, Registry } from "prom-client";
import { prometheusMetrics } from "./PrometheusMetrics";

export class PacientesMetrics {
  private registry: Registry;
  private patientCreateDuration: Histogram;
  private patientSearchDuration: Histogram;
  private patientsTotal: Gauge;

  constructor() {
    this.registry = prometheusMetrics.getRegistry();

    this.patientCreateDuration = new Histogram({
      name: "patient_create_duration_ms",
      help: "Duration of patient creation in milliseconds",
      labelNames: ["clinic_id"],
      buckets: [50, 100, 250, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });

    this.patientSearchDuration = new Histogram({
      name: "patient_search_duration_ms",
      help: "Duration of patient search in milliseconds",
      labelNames: ["clinic_id"],
      buckets: [10, 50, 100, 250, 500, 1000, 2000],
      registers: [this.registry],
    });

    this.patientsTotal = new Gauge({
      name: "patients_total",
      help: "Total number of patients by status and clinic",
      labelNames: ["status", "clinic_id"],
      registers: [this.registry],
    });
  }

  observePatientCreateDuration(clinicId: string, durationMs: number): void {
    this.patientCreateDuration.observe({ clinic_id: clinicId }, durationMs);
  }

  observePatientSearchDuration(clinicId: string, durationMs: number): void {
    this.patientSearchDuration.observe({ clinic_id: clinicId }, durationMs);
  }

  setPatientsTotal(status: string, clinicId: string, count: number): void {
    this.patientsTotal.set({ status, clinic_id: clinicId }, count);
  }

  incPatientsTotal(status: string, clinicId: string): void {
    this.patientsTotal.inc({ status, clinic_id: clinicId });
  }

  decPatientsTotal(status: string, clinicId: string): void {
    this.patientsTotal.dec({ status, clinic_id: clinicId });
  }
}

export const pacientesMetrics = new PacientesMetrics();
