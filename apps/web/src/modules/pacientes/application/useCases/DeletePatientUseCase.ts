import type { IPatientRepository } from "../../domain/repositories/IPatientRepository";

export class DeletePatientUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(id: string): Promise<void> {
    return this.patientRepository.delete(id);
  }
}
