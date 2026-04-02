import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { DomainEvent } from "./DomainEvent";

// Note: domain_events uses `prisma as any` until `prisma generate` is re-run
// after adding the domain_events model to the schema.
export class EventStore {
  async append(event: DomainEvent): Promise<void> {
    try {
      await (prisma as any).domain_events.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: {
          aggregate_id: event.aggregateId,
          event_type: event.eventType,
          payload: event as unknown as Record<string, unknown>,
          occurred_at: event.occurredOn,
        },
      });
    } catch (error) {
      logger.error("EventStore: failed to persist domain event", { error, eventType: event.eventType });
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    try {
      const rows = await (prisma as any).domain_events.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { aggregate_id: aggregateId },
        orderBy: { occurred_at: "asc" },
      });
      return rows.map((r: any) => r.payload as DomainEvent); // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (error) {
      logger.error("EventStore: failed to retrieve domain events", { error, aggregateId });
      return [];
    }
  }
}

export const eventStore = new EventStore();
