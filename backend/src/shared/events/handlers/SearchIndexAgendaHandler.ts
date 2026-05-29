import { EventHandler } from "../EventHandler";
import { DomainEvent } from "../DomainEvent";
import { AppointmentCreatedEvent } from "@/modules/agenda/domain/events/AppointmentCreatedEvent";
import { AppointmentUpdatedEvent } from "@/modules/agenda/domain/events/AppointmentUpdatedEvent";
import { AppointmentDeletedEvent } from "@/modules/agenda/domain/events/AppointmentDeletedEvent";
import { AgendaIndexer } from "@/modules/search_index/services/AgendaIndexer";
import { logger } from "@/infrastructure/logger";

export class SearchIndexAgendaHandler implements EventHandler<DomainEvent> {
  constructor(private agendaIndexer: AgendaIndexer) {}

  async handle(event: DomainEvent): Promise<void> {
    try {
      if (
        event instanceof AppointmentCreatedEvent ||
        event instanceof AppointmentUpdatedEvent
      ) {
        await this.agendaIndexer.reindexById(event.appointmentId);
        logger.debug("Agenda reindexada em tempo real", {
          appointmentId: event.appointmentId,
        });
      } else if (event instanceof AppointmentDeletedEvent) {
        await this.agendaIndexer.deleteByEntityId(event.appointmentId);
        logger.debug("Entrada de agenda removida do search_index", {
          appointmentId: event.appointmentId,
        });
      }
    } catch (error) {
      logger.error("Erro ao reindexar agenda em tempo real", {
        error,
        eventType: event.eventType,
      });
      // Nao lancar erro para nao interromper o fluxo principal
    }
  }
}
