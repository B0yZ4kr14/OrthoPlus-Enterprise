import { DomainEvent } from '@/shared/events/DomainEvent';

export class AppointmentDeletedEvent extends DomainEvent {
  constructor(
    public readonly appointmentId: string,
    public readonly clinicId: string
  ) {
    super('AppointmentDeleted');
  }
}
