import { DomainEvent } from '@/shared/events/DomainEvent';

export class AppointmentCreatedEvent extends DomainEvent {
  constructor(
    public readonly appointmentId: string,
    public readonly clinicId: string,
    public readonly patientId: string
  ) {
    super('AppointmentCreated');
  }
}
