import { logger } from "@/infrastructure/logger";
import cron from "node-cron";
import { IAppointmentRepository } from "@/modules/agenda/domain/repositories/IAppointmentRepository";
import { AppointmentRepositoryPostgres } from "@/modules/agenda/infrastructure/repositories/AppointmentRepositoryPostgres";
import { IAppointmentReminderRepository } from "@/modules/agenda/domain/repositories/IAppointmentReminderRepository";
import { AppointmentReminderRepositoryPostgres } from "@/modules/agenda/infrastructure/repositories/AppointmentReminderRepositoryPostgres";
import { AppointmentReminder } from "@/modules/agenda/domain/entities/AppointmentReminder";

// Replacing schedule-appointments edge function
export const runScheduleAppointmentsJob = async () => {
  const appointmentRepo: IAppointmentRepository =
    new AppointmentRepositoryPostgres();
  const reminderRepo: IAppointmentReminderRepository =
    new AppointmentReminderRepositoryPostgres();

  logger.info("Running scheduled appointments job...");
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nowStr = now.toISOString();
    const tomorrowStr = tomorrow.toISOString();

    const appointments = await appointmentRepo.findUpcomingAppointments(
      nowStr,
      tomorrowStr,
    );

    logger.info(`Found ${appointments.length} upcoming appointments.`);

    for (const apt of appointments) {
      const patient = await appointmentRepo.findPatientPhoneById(
        apt.patient_id,
      );

      if (patient?.phone_primary) {
        // Check if a reminder already exists for this appointment
        const existingReminders = await reminderRepo.findByAppointmentId(
          apt.id,
        );
        const hasPendingReminder = existingReminders.some(
          (r) =>
            r.reminderType === "LEMBRETE" &&
            ["PENDENTE", "ENVIADA"].includes(r.status),
        );

        if (!hasPendingReminder) {
          const reminder = AppointmentReminder.create({
            appointmentId: apt.id,
            messageTemplate: `Olá ${patient.full_name}, lembramos que você tem consulta agendada amanhã às ${new Date(apt.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`,
            reminderType: "LEMBRETE",
            scheduledFor: new Date(apt.start_time),
            phoneNumber: patient.phone_primary,
          });

          await reminderRepo.save(reminder);
          logger.info(
            `Created reminder for ${patient.full_name} at ${patient.phone_primary}`,
          );
        } else {
          logger.info(
            `Reminder already exists for ${patient.full_name}, skipping.`,
          );
        }
      }
    }
  } catch (error) {
    logger.error("Error in schedule-appointments cron: ", error);
  }
};

// Auto-confirmation job: creates confirmation reminders for appointments in 2 days
export const runAutoConfirmJob = async () => {
  const appointmentRepo: IAppointmentRepository =
    new AppointmentRepositoryPostgres();
  const reminderRepo: IAppointmentReminderRepository =
    new AppointmentReminderRepositoryPostgres();

  logger.info("Running auto-confirmation job...");
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const startOfDay = new Date(twoDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(twoDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await appointmentRepo.findUpcomingAppointments(
      startOfDay.toISOString(),
      endOfDay.toISOString(),
    );

    logger.info(
      `Found ${appointments.length} appointments in 2 days for auto-confirmation.`,
    );

    for (const apt of appointments) {
      const patient = await appointmentRepo.findPatientPhoneById(
        apt.patient_id,
      );

      if (patient?.phone_primary) {
        const existingReminders = await reminderRepo.findByAppointmentId(
          apt.id,
        );
        const hasPendingConfirm = existingReminders.some(
          (r) =>
            r.reminderType === "CONFIRMACAO" &&
            ["PENDENTE", "ENVIADA"].includes(r.status),
        );

        if (!hasPendingConfirm) {
          const reminder = AppointmentReminder.create({
            appointmentId: apt.id,
            messageTemplate: `Olá ${patient.full_name}, você tem consulta agendada para ${new Date(apt.start_time).toLocaleDateString("pt-BR")} às ${new Date(apt.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}. Confirme respondendo SIM.`,
            reminderType: "CONFIRMACAO",
            scheduledFor: new Date(apt.start_time),
            phoneNumber: patient.phone_primary,
          });

          await reminderRepo.save(reminder);
          logger.info(`Created confirmation reminder for ${patient.full_name}`);
        }
      }
    }
  } catch (error) {
    logger.error("Error in auto-confirmation cron: ", error);
  }
};

// Recall job: creates recall reminders for appointments 6+ months old
export const runRecallJob = async () => {
  logger.info("Running recall job...");
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    logger.warn(
      `[Agenda] Recall job: implementar query de pacientes sem consultas desde ${sixMonthsAgo.toISOString()}`,
    );
  } catch (error) {
    logger.error("Error in recall cron: ", error);
  }
};

export const startScheduleAppointmentsCron = () => {
  cron.schedule("0 * * * *", runScheduleAppointmentsJob);
  logger.info("Scheduled Appointments Job initialized: running every hour.");
};

export const startAutoConfirmCron = () => {
  cron.schedule("0 9 * * *", runAutoConfirmJob);
  logger.info("Auto-Confirmation Job initialized: running daily at 9 AM.");
};

export const startRecallCron = () => {
  cron.schedule("0 10 * * 1", runRecallJob);
  logger.info("Recall Job initialized: running weekly on Mondays at 10 AM.");
};
