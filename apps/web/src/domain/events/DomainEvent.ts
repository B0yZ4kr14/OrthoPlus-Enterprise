/**
 * FASE 1: DOMAIN EVENTS
 * Interface base para todos os eventos de domínio
 */

export interface DomainEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly aggregateId: string;
  public readonly eventType: string;

  constructor(
    aggregateId: string,
    eventType: string,
    public readonly payload: Record<string, unknown>,
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
    this.eventType = eventType;
  }
}
