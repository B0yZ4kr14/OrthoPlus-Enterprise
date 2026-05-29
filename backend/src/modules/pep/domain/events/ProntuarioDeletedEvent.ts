import { DomainEvent } from "@/shared/events/DomainEvent";

export class ProntuarioDeletedEvent extends DomainEvent {
  constructor(
    public readonly prontuarioId: string,
    public readonly clinicId: string,
  ) {
    super("ProntuarioDeleted");
  }
}
