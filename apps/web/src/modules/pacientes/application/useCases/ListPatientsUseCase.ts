import type { IPatientRepository } from "../../domain/repositories/IPatientRepository";
import type { Patient } from "@/types/patient";

export class ListPatientsUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(): Promise<Patient[]> {
    return this.patientRepository.findAll();
  }
}
