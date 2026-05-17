import { DomainEvent } from "@/shared/events/DomainEvent";

export class PatientPhotoUpdatedEvent extends DomainEvent {
  constructor(
    public readonly patientId: string,
    public readonly photoUrl: string | undefined,
  ) {
    super("PatientPhotoUpdated", patientId);
  }
}
