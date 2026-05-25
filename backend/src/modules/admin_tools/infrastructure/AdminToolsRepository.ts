import { prisma } from "@/infrastructure/database/prismaClient";

export class AdminToolsRepository {
  // --- ADRs ---
  async findAdrsByClinic(clinicId: string) {
    return (prisma as any).architecture_decision_records.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
  }

  async createAdr(data: Record<string, unknown>) {
    return (prisma as any).architecture_decision_records.create({ data });
  }

  // --- Wiki ---
  async findWikiPagesByClinic(clinicId: string) {
    return (prisma as any).wiki_pages.findMany({
      where: { clinic_id: clinicId },
      orderBy: { updated_at: "desc" },
    });
  }

  async createWikiPage(data: Record<string, unknown>) {
    return (prisma as any).wiki_pages.create({ data });
  }

  async findWikiPageByIdAndClinic(id: string, clinicId: string) {
    return (prisma as any).wiki_pages.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateWikiPage(id: string, data: Record<string, unknown>) {
    return (prisma as any).wiki_pages.update({
      where: { id },
      data,
    });
  }

  async deleteWikiPage(id: string, clinicId: string) {
    return (prisma as any).wiki_pages.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }
}
