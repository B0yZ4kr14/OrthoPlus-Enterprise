import { DomainEvent } from "@/shared/events/DomainEvent";

export class TratamentoUpdatedEvent extends DomainEvent {
  constructor(
    public readonly tratamentoId: string,
    public readonly prontuarioId: string,
    public readonly clinicId: string,
  ) {
    super("TratamentoUpdated");
  }
}
