import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import cron from "node-cron";


// Replacing schedule-appointments edge function
export const runScheduleAppointmentsJob = async () => {
  logger.info("Running scheduled appointments job...");
  try {
    // 1. Fetch upcoming appointments
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await (prisma as any).appointments.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: {
        data_hora: {
          gte: now,
          lt: tomorrow,
        },
        status: "AGENDADO",
      },
      include: {
        patients: true,
      },
    });

    logger.info(
      `Found ${appointments.length} upcoming appointments. Supposed to send reminders.`,
    );

    // 2. Logic to send Whatsapp/Email reminders goes here
    for (const apt of appointments) {
      if (apt.patients && apt.patients.celular) {
        // Send mock whatsapp
        // await sendWhatsappWithMessage(apt.patients.celular, "Lembrete: Você tem consulta amanhã.");
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
