import { DomainEvent } from '@/shared/events/DomainEvent';

export class ProntuarioCreatedEvent extends DomainEvent {
  constructor(
    public readonly prontuarioId: string,
    public readonly clinicId: string,
    public readonly patientId: string
  ) {
    super('ProntuarioCreated');
  }
}
