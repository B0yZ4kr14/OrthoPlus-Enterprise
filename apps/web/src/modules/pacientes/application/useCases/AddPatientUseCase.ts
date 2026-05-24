import type { IPatientRepository } from "../../domain/repositories/IPatientRepository";
import type { Patient } from "@/types/patient";

export class AddPatientUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(patientData: Partial<Patient>): Promise<Patient> {
    return this.patientRepository.save(patientData);
  }
}
