import { DomainEvent } from "@/shared/events/DomainEvent";

export class ProntuarioUpdatedEvent extends DomainEvent {
  constructor(
    public readonly prontuarioId: string,
    public readonly clinicId: string,
  ) {
    super("ProntuarioUpdated");
  }
}
