import { Prisma } from "@prisma/client";
import type {
  appointments,
  appointment_confirmations,
  blocked_times,
  dentist_schedules,
} from "@prisma/client";

export type AppointmentStatusFilter = string | { notIn: string[] };

export type AppointmentTimeFilter = { gte?: string; lte?: string };

/**
 * IAgendaRepository — interface for agenda module database access.
 * Decouples service layer from Prisma / infrastructure details.
 */
export interface IAgendaRepository {
  // ── Appointments ──────────────────────────────────────────────────────
  findAppointments(
    clinicId: string,
    filters: {
      id?: string;
      dentistId?: string;
      patientId?: string;
      status?: AppointmentStatusFilter;
      startTime?: AppointmentTimeFilter;
    },
  ): Promise<appointments[]>;

  findAppointmentById(
    id: string,
    clinicId: string,
  ): Promise<appointments | null>;

  updateAppointment(
    id: string,
    clinicId: string,
    data: Prisma.appointmentsUpdateInput,
  ): Promise<appointments>;

  deleteAppointment(id: string, clinicId: string): Promise<appointments>;

  findAppointmentConflicts(
    clinicId: string,
    dentistId: string,
    startIso: string,
    endIso: string,
    excludeId?: string,
  ): Promise<{ id: string }[]>;

  // ── Appointment Confirmations ─────────────────────────────────────────
  findConfirmationsByAppointmentIds(
    appointmentIds: string[],
    status?: string,
  ): Promise<appointment_confirmations[]>;

  findConfirmationById(id: string): Promise<appointment_confirmations | null>;

  createConfirmation(
    data: Prisma.appointment_confirmationsCreateInput,
  ): Promise<appointment_confirmations>;

  updateConfirmation(
    id: string,
    clinicId: string,
    data: Prisma.appointment_confirmationsUpdateInput,
  ): Promise<appointment_confirmations>;

  deleteConfirmation(id: string, clinicId: string): Promise<appointment_confirmations>;

  // ── Blocked Times ─────────────────────────────────────────────────────
  findBlockedTimes(
    clinicId: string,
    filters: {
      dentistId?: string;
      endDatetime?: Prisma.StringFilter<"blocked_times">;
      startDatetime?: Prisma.StringFilter<"blocked_times">;
    },
  ): Promise<blocked_times[]>;

  findBlockedTimeById(
    id: string,
    clinicId: string,
  ): Promise<blocked_times | null>;

  createBlockedTime(
    data: Prisma.blocked_timesCreateInput,
  ): Promise<blocked_times>;

  deleteBlockedTime(id: string, clinicId: string): Promise<blocked_times>;

  // ── Dentist Schedules ─────────────────────────────────────────────────
  findDentistSchedules(
    clinicId: string,
    filters: {
      dentistId?: string;
      dayOfWeek?: number;
      isActive?: boolean;
    },
  ): Promise<dentist_schedules[]>;

  findDentistScheduleById(
    id: string,
    clinicId: string,
  ): Promise<dentist_schedules | null>;

  createDentistSchedule(
    data: Prisma.dentist_schedulesCreateInput,
  ): Promise<dentist_schedules>;

  updateDentistSchedule(
    id: string,
    clinicId: string,
    data: Prisma.dentist_schedulesUpdateInput,
  ): Promise<dentist_schedules>;

  deleteDentistSchedule(id: string, clinicId: string): Promise<dentist_schedules>;
}
