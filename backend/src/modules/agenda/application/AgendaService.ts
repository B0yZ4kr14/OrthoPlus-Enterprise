import { logger } from "@/infrastructure/logger";
import { IAgendaRepository } from "@/modules/agenda/domain/repositories/IAgendaRepository";
import { AppointmentRepositoryPostgres } from "@/modules/agenda/infrastructure/repositories/AppointmentRepositoryPostgres";
import { CreateAppointmentCommandHandler } from "@/modules/agenda/application/commands/CreateAppointmentCommand";
import { eventBus } from "@/shared/events/EventBus";
import { AppointmentUpdatedEvent } from "@/modules/agenda/domain/events/AppointmentUpdatedEvent";
import { AppointmentDeletedEvent } from "@/modules/agenda/domain/events/AppointmentDeletedEvent";
import { agendaMetrics } from "@/infrastructure/metrics/AgendaMetrics";
import { MetricsEmitter } from "@/infrastructure/metrics";
import { AuditLogRepository } from "@/modules/database_admin/infrastructure/AuditLogRepository";
import { AgendaRepository } from "@/modules/agenda/infrastructure/AgendaRepository";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  confirmationCreateSchema,
  confirmationUpdateSchema,
  blockedTimeCreateSchema,
  dentistScheduleCreateSchema,
  dentistScheduleUpdateSchema,
} from "@/modules/agenda/api/schemas";

export class AgendaService {
  private repo: IAgendaRepository;
  private appointmentRepo = new AppointmentRepositoryPostgres();
  private createHandler = new CreateAppointmentCommandHandler(
    this.appointmentRepo,
    eventBus,
  );
  private audit = new AuditLogRepository();

  constructor(repo?: IAgendaRepository) {
    this.repo = repo ?? new AgendaRepository();
  }

  // ─── Appointments ───

  async listAppointments(
    clinicId: string,
    query: {
      dentistId?: string;
      patientId?: string;
      status?: any;
      startTime?: any;
    },
  ) {
    const start = Date.now();
    try {
      const result = await this.repo.findAppointments(clinicId, query);
      const duration = Date.now() - start;
      agendaMetrics.observeCalendarLoadDuration(clinicId, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      agendaMetrics.observeCalendarLoadDuration(clinicId, duration);
      throw error;
    }
  }

  async getAppointment(id: string, clinicId: string) {
    const appointment = await this.repo.findAppointmentById(id, clinicId);
    if (!appointment) {
      const err = new Error("Appointment not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return appointment;
  }

  async createAppointment(clinicId: string, body: unknown) {
    const parsed = appointmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      const err = new Error("Invalid input") as any;
      err.statusCode = 400;
      err.details = parsed.error.flatten();
      throw err;
    }

    const appointment = await this.createHandler.execute({
      patientId: parsed.data.patient_id,
      dentistId: parsed.data.dentist_id,
      startTime: new Date(parsed.data.start_time),
      endTime: new Date(parsed.data.end_time),
      type: parsed.data.title,
      notes: parsed.data.description,
      clinicId,
      createdBy: parsed.data.created_by,
    });

    MetricsEmitter.incrementCounter(
      "agenda_appointment_created",
      "Appointments created",
      { clinicId, type: parsed.data.title },
    );
    try {
      await this.audit.createLog({
        table_name: "appointments",
        record_id: appointment.id,
        action: "CREATE",
        clinic_id: clinicId,
        user_id: parsed.data.created_by,
        old_data: null,
        new_data: appointment,
        created_at: new Date(),
      });
    } catch {
      /* audit failure is non-blocking */
    }

    return appointment;
  }

  async updateAppointment(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.findAppointmentById(id, clinicId);
    if (!existing) {
      const err = new Error("Appointment not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const parsed = appointmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const err = new Error("Invalid input") as any;
      err.statusCode = 400;
      err.details = parsed.error.flatten();
      throw err;
    }

    const appointment = await this.repo.updateAppointment(id, {
      ...parsed.data,
      updated_at: new Date(),
    });

    MetricsEmitter.incrementCounter(
      "agenda_appointment_updated",
      "Appointments updated",
      { clinicId },
    );

    // Reindexacao em tempo real (non-blocking)
    eventBus
      .publish(new AppointmentUpdatedEvent(id, clinicId, existing.patient_id))
      .catch((err) => {
        logger.warn("Appointment indexing failure (non-blocking)", { appointmentId: id, clinicId, error: err })
      });

    try {
      await this.audit.createLog({
        table_name: "appointments",
        record_id: id,
        action: "UPDATE",
        clinic_id: clinicId,
        user_id: "system",
        old_data: existing,
        new_data: appointment,
        created_at: new Date(),
      });
    } catch {
      /* audit failure is non-blocking */
    }

    return appointment;
  }

  async deleteAppointment(id: string, clinicId: string) {
    const existing = await this.repo.findAppointmentById(id, clinicId);
    if (!existing) {
      const err = new Error("Appointment not found") as any;
      err.statusCode = 404;
      throw err;
    }

    await this.repo.deleteAppointment(id);

    MetricsEmitter.incrementCounter(
      "agenda_appointment_deleted",
      "Appointments deleted",
      { clinicId },
    );

    // Reindexacao em tempo real (non-blocking)
    eventBus.publish(new AppointmentDeletedEvent(id, clinicId)).catch(() => {
      /* indexing failure is non-blocking */
    });

    try {
      await this.audit.createLog({
        table_name: "appointments",
        record_id: id,
        action: "DELETE",
        clinic_id: clinicId,
        user_id: "system",
        old_data: existing,
        new_data: null,
        created_at: new Date(),
      });
    } catch {
      /* audit failure is non-blocking */
    }
  }

  async checkConflict(
    clinicId: string,
    query: {
      dentistId: string;
      startTime: string;
      endTime: string;
      excludeId?: string;
    },
  ) {
    const startIso = new Date(query.startTime).toISOString();
    const endIso = new Date(query.endTime).toISOString();
    const conflicts = await this.repo.findAppointmentConflicts(
      clinicId,
      query.dentistId,
      startIso,
      endIso,
      query.excludeId,
    );
    return { hasConflict: conflicts.length > 0, count: conflicts.length };
  }

  // ─── Confirmations ───

  async listConfirmations(
    clinicId: string,
    query: { appointmentId?: string; status?: string },
  ) {
    const clinicAppointments = await this.repo.findAppointments(clinicId, {
      ...(query.appointmentId ? { id: query.appointmentId } : {}),
    });
    const appointmentIds = clinicAppointments.map((a) => a.id);
    return this.repo.findConfirmationsByAppointmentIds(
      appointmentIds,
      query.status,
    );
  }

  async getConfirmation(id: string, clinicId: string) {
    const confirmation = await this.repo.findConfirmationById(id);
    if (!confirmation) {
      const err = new Error("Confirmation not found") as any;
      err.statusCode = 404;
      throw err;
    }
    const appointment = await this.repo.findAppointmentById(
      confirmation.appointment_id,
      clinicId,
    );
    if (!appointment) {
      const err = new Error("Confirmation not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return confirmation;
  }

  async createConfirmation(clinicId: string, body: unknown) {
    const parsed = confirmationCreateSchema.safeParse(body);
    if (!parsed.success) {
      const err = new Error("Invalid input") as any;
      err.statusCode = 400;
      err.details = parsed.error.flatten();
      throw err;
    }

    const appointment = await this.repo.findAppointmentById(
      parsed.data.appointment_id,
      clinicId,
    );
    if (!appointment) {
      const err = new Error("Appointment not found") as any;
      err.statusCode = 404;
      throw err;
    }

    return this.repo.createConfirmation(parsed.data);
  }

  async updateConfirmation(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.findConfirmationById(id);
    if (!existing) {
      const err = new Error("Confirmation not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const appointment = await this.repo.findAppointmentById(
      existing.appointment_id,
      clinicId,
    );
    if (!appointment) {
      const err = new Error("Confirmation not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const parsed = confirmationUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const err = new Error("Invalid input") as any;
      err.statusCode = 400;
      err.details = parsed.error.flatten();
      throw err;
    }

    return this.repo.updateConfirmation(id, parsed.data);
  }

  async deleteConfirmation(id: string, clinicId: string) {
    const existing = await this.repo.findConfirmationById(id);
    if (!existing) {
      const err = new Error("Confirmation not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const appointment = await this.repo.findAppointmentById(
      existing.appointment_id,
      clinicId,
    );
    if (!appointment) {
      const err = new Error("Confirmation not found") as any;
      err.statusCode = 404;
      throw err;
    }

    await this.repo.deleteConfirmation(id);
  }

  // ─── Blocked Times ───

  async listBlockedTimes(
    clinicId: string,
    query: {
      dentistId?: string;
      endDatetime?: any;
      startDatetime?: any;
    },
  ) {
    return this.repo.findBlockedTimes(clinicId, query);
  }

  async getBlockedTime(id: string, clinicId: string) {
    const item = await this.repo.findBlockedTimeById(id, clinicId);
    if (!item) {
      const err = new Error("Blocked time not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return item;
  }

  async createBlockedTime(clinicId: string, body: unknown) {
    const parsed = blockedTimeCreateSchema.safeParse(body);
    if (!parsed.success) {
      const err = new Error("Invalid input") as any;
      err.statusCode = 400;
      err.details = parsed.error.flatten();
      throw err;
    }

    return this.repo.createBlockedTime({ ...parsed.data, clinic_id: clinicId });
  }

  async deleteBlockedTime(id: string, clinicId: string) {
    const existing = await this.repo.findBlockedTimeById(id, clinicId);
    if (!existing) {
      const err = new Error("Blocked time not found") as any;
      err.statusCode = 404;
      throw err;
    }
    await this.repo.deleteBlockedTime(id);
  }

  // ─── Dentist Schedules ───

  async listDentistSchedules(
    clinicId: string,
    query: {
      dentistId?: string;
      dayOfWeek?: number;
      isActive?: boolean;
    },
  ) {
    return this.repo.findDentistSchedules(clinicId, query);
  }

  async getDentistSchedule(id: string, clinicId: string) {
    const item = await this.repo.findDentistScheduleById(id, clinicId);
    if (!item) {
      const err = new Error("Schedule not found") as any;
      err.statusCode = 404;
      throw err;
    }
    return item;
  }

  async createDentistSchedule(clinicId: string, body: unknown) {
    const parsed = dentistScheduleCreateSchema.safeParse(body);
    if (!parsed.success) {
      const err = new Error("Invalid input") as any;
      err.statusCode = 400;
      err.details = parsed.error.flatten();
      throw err;
    }

    return this.repo.createDentistSchedule({
      ...parsed.data,
      clinic_id: clinicId,
    });
  }

  async updateDentistSchedule(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.findDentistScheduleById(id, clinicId);
    if (!existing) {
      const err = new Error("Schedule not found") as any;
      err.statusCode = 404;
      throw err;
    }

    const parsed = dentistScheduleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const err = new Error("Invalid input") as any;
      err.statusCode = 400;
      err.details = parsed.error.flatten();
      throw err;
    }

    return this.repo.updateDentistSchedule(id, parsed.data);
  }

  async deleteDentistSchedule(id: string, clinicId: string) {
    const existing = await this.repo.findDentistScheduleById(id, clinicId);
    if (!existing) {
      const err = new Error("Schedule not found") as any;
      err.statusCode = 404;
      throw err;
    }
    await this.repo.deleteDentistSchedule(id);
  }
}
