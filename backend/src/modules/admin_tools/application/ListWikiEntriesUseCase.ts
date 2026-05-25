import { AdminToolsRepository } from "../infrastructure/AdminToolsRepository";

export class ListWikiEntriesUseCase {
  constructor(private readonly repository: AdminToolsRepository = new AdminToolsRepository()) {}

  async execute(clinicId: string) {
    return this.repository.findWikiPagesByClinic(clinicId);
  }
}
