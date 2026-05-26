import { DomainEvent } from "@/shared/events/DomainEvent";

export class PatientUpdatedEvent extends DomainEvent {
  constructor(
    public readonly patientId: string,
    public readonly clinicId: string,
  ) {
    super("Pacientes.PatientUpdated", patientId);
  }
}
