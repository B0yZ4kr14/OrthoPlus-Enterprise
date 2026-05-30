import { logger } from "@/infrastructure/logger";
import cron from "node-cron";
import { IAppointmentRepository } from "@/modules/agenda/domain/repositories/IAppointmentRepository";
import { AppointmentRepositoryPostgres } from "@/modules/agenda/infrastructure/repositories/AppointmentRepositoryPostgres";

// Replacing schedule-appointments edge function
export const runScheduleAppointmentsJob = async () => {
  const repo: IAppointmentRepository = new AppointmentRepositoryPostgres();
  logger.info("Running scheduled appointments job...");
  try {
    // 1. Fetch upcoming appointments
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Converter datas para string ISO (campo start_time é String no schema)
    const nowStr = now.toISOString();
    const tomorrowStr = tomorrow.toISOString();

    const appointments = await repo.findUpcomingAppointments(
      nowStr,
      tomorrowStr,
    );

    logger.info(
      `Found ${appointments.length} upcoming appointments. Supposed to send reminders.`,
    );

    // 2. Fetch patient data separately (sem relation definida no schema)
    for (const apt of appointments) {
      const patient = await repo.findPatientPhoneById(apt.patient_id);

      if (patient?.phone_primary) {
        logger.info(
          `Would send reminder to ${patient.full_name} at ${patient.phone_primary}`,
        );
        // Send mock whatsapp
        // await sendWhatsappWithMessage(patient.phone_primary, `Lembrete: Você tem consulta amanhã às ${apt.start_time}.`);
      }
    }
  } catch (error) {
    logger.error("Error in schedule-appointments cron: ", error);
  }
};

export const startScheduleAppointmentsCron = () => {
  // Run every hour
  cron.schedule("0 * * * *", runScheduleAppointmentsJob);
  logger.info("Scheduled Appointments Job initialized: running every hour.");
};
