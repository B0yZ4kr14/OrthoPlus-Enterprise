import { DomainEvent } from './DomainEvent';
import { EventHandler } from './EventHandler';
import { logger } from '@/infrastructure/logger';

export class EventBus {
  private handlers: Map<string, EventHandler<DomainEvent>[]> = new Map();

  register<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    const existingHandlers = this.handlers.get(eventType);
    if (existingHandlers) {
      existingHandlers.push(handler as EventHandler<DomainEvent>);
    }
    logger.debug('Handler registrado para evento ' + eventType);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    if (!handlers || handlers.length === 0) {
      logger.warn('Nenhum handler encontrado para evento: ' + event.eventType);
      return;
    }

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler.handle(event);
          logger.debug('Evento processado com sucesso: ' + event.eventType);
        } catch (error) {
          logger.error('Erro ao processar evento: ' + event.eventType, { error });
        }
      })
    );
  }

  clearHandlers(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
