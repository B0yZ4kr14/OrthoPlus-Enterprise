import { IAppointmentReminderRepository } from "../../domain/repositories/IAppointmentReminderRepository";
import { AppointmentReminder } from "../../domain/entities/AppointmentReminder";
import { prisma } from "@/infrastructure/database/prismaClient";

export class AppointmentReminderRepositoryPostgres implements IAppointmentReminderRepository {
  async findById(id: string): Promise<AppointmentReminder | null> {
    const result = await prisma.appointment_reminders.findUnique({
      where: { id },
    });
    return result ? this.mapToEntity(result) : null;
  }

  async findByAppointmentId(
    appointmentId: string,
  ): Promise<AppointmentReminder[]> {
    const rows = await prisma.appointment_reminders.findMany({
      where: { appointment_id: appointmentId },
      orderBy: { created_at: "desc" },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findPendentes(): Promise<AppointmentReminder[]> {
    const rows = await prisma.appointment_reminders.findMany({
      where: { status: "PENDENTE" },
      orderBy: { scheduled_for: "asc" },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async findEnviadasNaoConfirmadas(): Promise<AppointmentReminder[]> {
    const rows = await prisma.appointment_reminders.findMany({
      where: { status: "ENVIADA" },
      orderBy: { sent_at: "desc" },
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async save(reminder: AppointmentReminder): Promise<void> {
    await prisma.appointment_reminders.create({
      data: {
        id: reminder.id,
        appointment_id: reminder.appointmentId,
        message_template: reminder.messageTemplate,
        reminder_type: reminder.reminderType,
        scheduled_for: reminder.scheduledFor.toISOString(),
        status: reminder.status,
        phone_number: reminder.phoneNumber,
        created_at: reminder.createdAt,
      },
    });
  }

  async update(reminder: AppointmentReminder): Promise<void> {
    await prisma.appointment_reminders.update({
      where: { id: reminder.id },
      data: {
        status: reminder.status,
        sent_at: reminder.sentAt?.toISOString(),
        error_message: reminder.errorMessage,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.appointment_reminders.delete({ where: { id } });
  }

  private mapToEntity(raw: any): AppointmentReminder {
    return AppointmentReminder.restore({
      id: raw.id,
      appointmentId: raw.appointment_id,
      messageTemplate: raw.message_template,
      reminderType: raw.reminder_type,
      scheduledFor: new Date(raw.scheduled_for),
      status: raw.status,
      sentAt: raw.sent_at ? new Date(raw.sent_at) : undefined,
      errorMessage: raw.error_message ?? undefined,
      phoneNumber: raw.phone_number ?? undefined,
      createdAt: raw.created_at,
    });
  }
}
