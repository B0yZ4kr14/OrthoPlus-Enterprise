import { EventHandler } from "../EventHandler";
import { DomainEvent } from "../DomainEvent";
import { ProntuarioCreatedEvent } from "@/modules/pep/domain/events/ProntuarioCreatedEvent";
import { ProntuarioUpdatedEvent } from "@/modules/pep/domain/events/ProntuarioUpdatedEvent";
import { ProntuarioDeletedEvent } from "@/modules/pep/domain/events/ProntuarioDeletedEvent";
import { TratamentoCreatedEvent } from "@/modules/pep/domain/events/TratamentoCreatedEvent";
import { TratamentoUpdatedEvent } from "@/modules/pep/domain/events/TratamentoUpdatedEvent";
import { TratamentoDeletedEvent } from "@/modules/pep/domain/events/TratamentoDeletedEvent";
import { PepIndexer } from "@/modules/search_index/services/PepIndexer";
import { logger } from "@/infrastructure/logger";

export class SearchIndexPepHandler implements EventHandler<DomainEvent> {
  constructor(private pepIndexer: PepIndexer) {}

  async handle(event: DomainEvent): Promise<void> {
    try {
      if (
        event instanceof ProntuarioCreatedEvent ||
        event instanceof ProntuarioUpdatedEvent
      ) {
        await this.pepIndexer.reindexById(event.prontuarioId);
        logger.debug("PEP reindexado em tempo real", {
          prontuarioId: event.prontuarioId,
        });
      } else if (event instanceof ProntuarioDeletedEvent) {
        await this.pepIndexer.deleteByEntityId(event.prontuarioId);
        logger.debug("Entrada de prontuario removida do search_index", {
          prontuarioId: event.prontuarioId,
        });
      } else if (
        event instanceof TratamentoCreatedEvent ||
        event instanceof TratamentoUpdatedEvent ||
        event instanceof TratamentoDeletedEvent
      ) {
        // Quando um tratamento muda, reindexa o prontuario pai
        // porque o conteudo do PEP inclui os tratamentos
        await this.pepIndexer.reindexById(event.prontuarioId);
        logger.debug("PEP reindexado apos alteracao de tratamento", {
          tratamentoId: event.tratamentoId,
          prontuarioId: event.prontuarioId,
        });
      }
    } catch (error) {
      logger.error("Erro ao reindexar PEP em tempo real", {
        error,
        eventType: event.eventType,
      });
      // Nao lancar erro para nao interromper o fluxo principal
    }
  }
}
