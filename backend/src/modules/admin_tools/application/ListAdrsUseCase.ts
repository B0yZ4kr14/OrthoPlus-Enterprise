import { AdminToolsRepository } from "../infrastructure/AdminToolsRepository";

export class ListAdrsUseCase {
  constructor(
    private readonly repository: AdminToolsRepository = new AdminToolsRepository(),
  ) {}

  async execute(clinicId: string) {
    return this.repository.findAdrsByClinic(clinicId);
  }
}
