export abstract class DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredOn: Date;
  /**
   * The ID of the aggregate this event belongs to (e.g. patient.id, transaction.id).
   * Defaults to eventId when not provided — use the explicit parameter in aggregate contexts
   * to enable proper event replay via EventStore.getEvents(aggregateId).
   */
  readonly aggregateId: string;
  readonly aggregateType?: string;
  readonly version?: number;
  readonly payload?: unknown;
  readonly metadata?: unknown;

  constructor(eventType: string, aggregateId?: string) {
    this.eventId = crypto.randomUUID();
    this.eventType = eventType;
    this.occurredOn = new Date();
    this.aggregateId = aggregateId ?? this.eventId;
  }
}
