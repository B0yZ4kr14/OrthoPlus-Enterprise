import { AdminToolsRepository } from "../infrastructure/AdminToolsRepository";
import { Errors } from "@/middleware/errorHandler";

export class UpdateWikiEntryUseCase {
  constructor(
    private readonly repository: AdminToolsRepository = new AdminToolsRepository(),
  ) {}

  async execute(id: string, clinicId: string, data: Record<string, unknown>) {
    const existing = await this.repository.findWikiPageByIdAndClinic(
      id,
      clinicId,
    );
    if (!existing) {
      throw Errors.notFound("Wiki page", id);
    }
    return this.repository.updateWikiPage(id, data);
  }
}
