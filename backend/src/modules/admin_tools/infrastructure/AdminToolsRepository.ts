import { prisma } from "@/infrastructure/database/prismaClient";
import { IAdminToolsRepository } from "@/modules/admin_tools/domain/repositories/IAdminToolsRepository";

export class AdminToolsRepository implements IAdminToolsRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createUser(data: Record<string, unknown>) {
    return prisma.users.create({ data: data as any });
  }

  async updateUserRole(email: string, role: string) {
    return prisma.users.update({
      where: { email },
      data: { role },
    });
  }

  async getActiveConnections() {
    return prisma.$queryRaw`SELECT count(*) FROM pg_stat_activity`;
  }

  async getTableSizes() {
    return prisma.$queryRaw`
      SELECT relname as "table",
             pg_size_pretty(pg_total_relation_size(relid)) As "size"
      FROM pg_catalog.pg_statio_user_tables
      ORDER BY pg_total_relation_size(relid) DESC`;
  }

  async searchPatients(clinicId: string, query: string) {
    return prisma.patients.findMany({
      where: {
        clinic_id: clinicId,
        OR: [
          { full_name: { contains: query, mode: "insensitive" } },
          { cpf: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  async searchDentists(clinicId: string, query: string) {
    return prisma.profiles.findMany({
      where: {
        clinic_id: clinicId,
        app_role: { contains: "DENTIST", mode: "insensitive" },
        OR: [{ full_name: { contains: query, mode: "insensitive" } }],
      },
      take: 10,
    });
  }

  // ADR
  async findAdrsByClinic(clinicId: string) {
    return (prisma as any).adrs.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAdr(data: Record<string, unknown>) {
    return (prisma as any).adrs.create({ data: data as any });
  }

  // Wiki
  async findWikiPagesByClinic(clinicId: string) {
    return prisma.wiki_pages.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createWikiPage(data: Record<string, unknown>) {
    return prisma.wiki_pages.create({ data: data as any });
  }

  async findWikiPageByIdAndClinic(id: string, clinicId: string) {
    return prisma.wiki_pages.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateWikiPage(id: string, data: Record<string, unknown>) {
    return prisma.wiki_pages.update({ where: { id }, data: data as any });
  }

  async deleteWikiPage(id: string, clinicId: string) {
    return prisma.wiki_pages.deleteMany({
      where: { id, clinic_id: clinicId },
    });
  }

  async runVacuumAnalyze() {
    await prisma.$executeRawUnsafe(`VACUUM ANALYZE;`);
  }
}
