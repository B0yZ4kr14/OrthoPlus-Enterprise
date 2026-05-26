import { DomainEvent } from "@/shared/events/DomainEvent";

export class PatientCreatedEvent extends DomainEvent {
  constructor(
    public readonly patientId: string,
    public readonly clinicId: string,
  ) {
    super("Pacientes.PatientCreated", patientId);
  }
}
