import { IEventHandler } from "@/core/domain/events/EventBus";
import { AppointmentScheduledEvent } from "@/modules/agenda/domain/events/AppointmentScheduledEvent";
import { LeadConvertedEvent } from "@/modules/crm/domain/events/LeadConvertedEvent";

/**
 * Handler for sending email notifications based on events.
 */
export class EmailNotificationHandler implements IEventHandler<
  AppointmentScheduledEvent | LeadConvertedEvent
> {
  async handle(
    event: AppointmentScheduledEvent | LeadConvertedEvent,
  ): Promise<void> {
    if (event instanceof AppointmentScheduledEvent) {
      await this.sendAppointmentConfirmation(event);
    } else if (event instanceof LeadConvertedEvent) {
      await this.sendWelcomeEmail(event);
    }
  }

  private async sendAppointmentConfirmation(
    event: AppointmentScheduledEvent,
  ): Promise<void> {
    const emailEndpoint =
      import.meta.env.VITE_EMAIL_API_URL || "/api/rest/notifications/email";

    try {
      const response = await fetch(emailEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "APPOINTMENT_CONFIRMATION",
          agendamentoId: event.data.appointmentId,
          patientId: event.data.patientId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Email dispatch failed: HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn(
        "Email integration unavailable for appointment event.",
        error,
      );
    }
  }

  private async sendWelcomeEmail(event: LeadConvertedEvent): Promise<void> {
    const emailEndpoint =
      import.meta.env.VITE_EMAIL_API_URL || "/api/rest/notifications/email";

    try {
      const response = await fetch(emailEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WELCOME_LEAD_CONVERTED",
          leadId: event.data.leadId,
          patientId: event.data.patientId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Email dispatch failed: HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn(
        "Email integration unavailable for lead-conversion event.",
        error,
      );
    }
  }
}
