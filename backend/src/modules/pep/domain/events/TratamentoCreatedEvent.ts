import { DomainEvent } from "@/shared/events/DomainEvent";

export class TratamentoCreatedEvent extends DomainEvent {
  constructor(
    public readonly tratamentoId: string,
    public readonly prontuarioId: string,
    public readonly clinicId: string,
  ) {
    super("TratamentoCreated");
  }
}
