import { Patient } from '../../domain/entities/Patient';

export class PatientDTO {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly fullName: string,
    public readonly cpf: string | undefined,
    public readonly email: string | undefined,
    public readonly statusCode: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(patient: Patient): PatientDTO {
    return new PatientDTO(
      patient.id,
      patient.clinicId,
      patient.fullName,
      patient.cpf,
      patient.email,
      patient.statusCode,
      patient.isActive,
      patient.createdAt,
      patient.updatedAt,
    );
  }
}
