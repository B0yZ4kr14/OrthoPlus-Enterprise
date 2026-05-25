import { AdminToolsRepository } from "../infrastructure/AdminToolsRepository";

export class DeleteWikiEntryUseCase {
  constructor(private readonly repository: AdminToolsRepository = new AdminToolsRepository()) {}

  async execute(id: string, clinicId: string): Promise<void> {
    await this.repository.deleteWikiPage(id, clinicId);
  }
}
