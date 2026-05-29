import { Counter, Histogram, Registry } from "prom-client";
import { prometheusMetrics } from "./PrometheusMetrics";

export class AgendaMetrics {
  private registry: Registry;
  private appointmentCreateDuration: Histogram;
  private calendarLoadDuration: Histogram;
  private appointmentsTotal: Counter;

  constructor() {
    this.registry = prometheusMetrics.getRegistry();

    this.appointmentCreateDuration = new Histogram({
      name: "appointment_create_duration_ms",
      help: "Duration of appointment creation in milliseconds",
      labelNames: ["clinic_id", "status"],
      buckets: [10, 50, 100, 250, 500, 1000, 2500],
      registers: [this.registry],
    });

    this.calendarLoadDuration = new Histogram({
      name: "calendar_load_duration_ms",
      help: "Duration of calendar load in milliseconds",
      labelNames: ["clinic_id"],
      buckets: [50, 100, 250, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });

    this.appointmentsTotal = new Counter({
      name: "appointments_total",
      help: "Total number of appointments created",
      labelNames: ["status", "clinic_id"],
      registers: [this.registry],
    });
  }

  observeAppointmentCreateDuration(
    clinicId: string,
    status: string,
    durationMs: number,
  ): void {
    this.appointmentCreateDuration.observe(
      { clinic_id: clinicId, status },
      durationMs,
    );
  }

  observeCalendarLoadDuration(clinicId: string, durationMs: number): void {
    this.calendarLoadDuration.observe({ clinic_id: clinicId }, durationMs);
  }

  incrementAppointmentsTotal(status: string, clinicId: string): void {
    this.appointmentsTotal.inc({ status, clinic_id: clinicId });
  }
}

export const agendaMetrics = new AgendaMetrics();
