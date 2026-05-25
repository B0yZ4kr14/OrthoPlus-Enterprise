import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";

export type AppointmentStatusFilter = string | { notIn: string[] };

export type AppointmentTimeFilter = { gte?: string; lte?: string };

export class AgendaRepository {
  // ── Appointments ──────────────────────────────────────────────────────

  async findAppointments(
    clinicId: string,
    filters: {
      id?: string;
      dentistId?: string;
      patientId?: string;
      status?: AppointmentStatusFilter;
      startTime?: AppointmentTimeFilter;
    }
  ) {
    return prisma.appointments.findMany({
      where: {
        clinic_id: clinicId,
        ...(filters.id ? { id: filters.id } : {}),
        ...(filters.dentistId ? { dentist_id: filters.dentistId } : {}),
        ...(filters.patientId ? { patient_id: filters.patientId } : {}),
        ...(filters.status !== undefined ? { status: filters.status } : {}),
        ...(filters.startTime ? { start_time: filters.startTime } : {}),
      },
      orderBy: { start_time: "asc" },
    });
  }

  async findAppointmentById(id: string, clinicId: string) {
    return prisma.appointments.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateAppointment(
    id: string,
    data: Prisma.appointmentsUpdateInput
  ) {
    return prisma.appointments.update({ where: { id }, data });
  }

  async deleteAppointment(id: string) {
    return prisma.appointments.delete({ where: { id } });
  }

  async findAppointmentConflicts(
    clinicId: string,
    dentistId: string,
    startIso: string,
    endIso: string,
    excludeId?: string
  ) {
    return prisma.appointments.findMany({
      where: {
        clinic_id: clinicId,
        dentist_id: dentistId,
        status: { notIn: ["cancelado", "faltou"] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          { start_time: { lte: startIso }, end_time: { gte: startIso } },
          { start_time: { lte: endIso }, end_time: { gte: endIso } },
        ],
      },
      select: { id: true },
    });
  }

  // ── Appointment Confirmations ─────────────────────────────────────────

  async findConfirmationsByAppointmentIds(
    appointmentIds: string[],
    status?: string
  ) {
    const where: Prisma.appointment_confirmationsWhereInput = {
      appointment_id: { in: appointmentIds },
    };
    if (status) where.status = status;
    return prisma.appointment_confirmations.findMany({
      where,
      orderBy: { created_at: "asc" },
    });
  }

  async findConfirmationById(id: string) {
    return prisma.appointment_confirmations.findUnique({ where: { id } });
  }

  async createConfirmation(data: Prisma.appointment_confirmationsCreateInput) {
    return prisma.appointment_confirmations.create({ data });
  }

  async updateConfirmation(
    id: string,
    data: Prisma.appointment_confirmationsUpdateInput
  ) {
    return prisma.appointment_confirmations.update({ where: { id }, data });
  }

  async deleteConfirmation(id: string) {
    return prisma.appointment_confirmations.delete({ where: { id } });
  }

  // ── Blocked Times ─────────────────────────────────────────────────────

  async findBlockedTimes(
    clinicId: string,
    filters: {
      dentistId?: string;
      endDatetime?: Prisma.StringFilter<"blocked_times">;
      startDatetime?: Prisma.StringFilter<"blocked_times">;
    }
  ) {
    return prisma.blocked_times.findMany({
      where: {
        clinic_id: clinicId,
        ...(filters.dentistId ? { dentist_id: filters.dentistId } : {}),
        ...(filters.endDatetime ? { end_datetime: filters.endDatetime } : {}),
        ...(filters.startDatetime
          ? { start_datetime: filters.startDatetime }
          : {}),
      },
      orderBy: { start_datetime: "asc" },
    });
  }

  async findBlockedTimeById(id: string, clinicId: string) {
    return prisma.blocked_times.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createBlockedTime(data: Prisma.blocked_timesCreateInput) {
    return prisma.blocked_times.create({ data });
  }

  async deleteBlockedTime(id: string) {
    return prisma.blocked_times.delete({ where: { id } });
  }

  // ── Dentist Schedules ─────────────────────────────────────────────────

  async findDentistSchedules(
    clinicId: string,
    filters: {
      dentistId?: string;
      dayOfWeek?: number;
      isActive?: boolean;
    }
  ) {
    return prisma.dentist_schedules.findMany({
      where: {
        clinic_id: clinicId,
        ...(filters.dentistId ? { dentist_id: filters.dentistId } : {}),
        ...(filters.dayOfWeek !== undefined
          ? { day_of_week: filters.dayOfWeek }
          : {}),
        ...(filters.isActive !== undefined
          ? { is_active: filters.isActive }
          : {}),
      },
      orderBy: [{ dentist_id: "asc" }, { day_of_week: "asc" }],
    });
  }

  async findDentistScheduleById(id: string, clinicId: string) {
    return prisma.dentist_schedules.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createDentistSchedule(data: Prisma.dentist_schedulesCreateInput) {
    return prisma.dentist_schedules.create({ data });
  }

  async updateDentistSchedule(
    id: string,
    data: Prisma.dentist_schedulesUpdateInput
  ) {
    return prisma.dentist_schedules.update({ where: { id }, data });
  }

  async deleteDentistSchedule(id: string) {
    return prisma.dentist_schedules.delete({ where: { id } });
  }
}
