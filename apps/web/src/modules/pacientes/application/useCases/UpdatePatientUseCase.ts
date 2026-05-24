import type { IPatientRepository } from "../../domain/repositories/IPatientRepository";
import type { Patient } from "@/types/patient";

export class UpdatePatientUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(id: string, patientData: Partial<Patient>): Promise<Patient> {
    return this.patientRepository.update(id, patientData);
  }
}
