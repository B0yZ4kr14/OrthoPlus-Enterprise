import { AdminToolsRepository } from "../infrastructure/AdminToolsRepository";

export class UpdateWikiEntryUseCase {
  constructor(private readonly repository: AdminToolsRepository = new AdminToolsRepository()) {}

  async execute(id: string, clinicId: string, data: Record<string, unknown>) {
    const existing = await this.repository.findWikiPageByIdAndClinic(id, clinicId);
    if (!existing) {
      throw new Error("Wiki page not found");
    }
    return this.repository.updateWikiPage(id, data);
  }
}
