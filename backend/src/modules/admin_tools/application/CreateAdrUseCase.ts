import { AdminToolsRepository } from "../infrastructure/AdminToolsRepository";

export class CreateAdrUseCase {
  constructor(
    private readonly repository: AdminToolsRepository = new AdminToolsRepository(),
  ) {}

  async execute(
    clinicId: string,
    userId: string,
    data: Record<string, unknown>,
  ) {
    return this.repository.createAdr({
      ...data,
      clinic_id: clinicId,
      created_by: userId,
    });
  }
}
