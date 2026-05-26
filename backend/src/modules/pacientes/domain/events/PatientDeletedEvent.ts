import { DomainEvent } from "@/shared/events/DomainEvent";

export class PatientDeletedEvent extends DomainEvent {
  constructor(
    public readonly patientId: string,
    public readonly clinicId: string,
  ) {
    super("Pacientes.PatientDeleted", patientId);
  }
}
