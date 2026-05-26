import { prisma } from "@/infrastructure/database/prismaClient";
import { IReportRepository } from "@/modules/relatorios/domain/repositories/IReportRepository";

export class ReportRepository implements IReportRepository {
  async findProfileById(id: string) {
    return (prisma as any).profiles.findUnique({ where: { id } });
  }

  async findClinicModules(clinicId: string) {
    return (prisma as any).clinic_modules.findMany({
      where: { clinic_id: clinicId },
    });
  }

  async findModuleCatalogs(ids: number[]) {
    if (ids.length === 0) return [];
    return (prisma as any).module_catalog.findMany({
      where: { id: { in: ids } },
    });
  }

  async findPatientsByClinic(clinicId: string) {
    return (prisma as any).patients.findMany({
      where: { clinic_id: clinicId },
      select: {
        id: true,
        cpf: true,
        nome: true,
        email: true,
        telefone: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findWikiPageVersions(take = 100) {
    return (prisma as any).wiki_page_versions.findMany({ take });
  }

  async findProntuariosByClinic(clinicId: string) {
    return prisma.prontuarios.findMany({ where: { clinic_id: clinicId } });
  }

  async findAppointmentsOrthoByClinic(clinicId: string) {
    return (prisma as any).appointments_ortho.findMany({
      where: { clinic_id: clinicId },
    });
  }

  async findContasReceberByClinic(clinicId: string) {
    return prisma.contas_receber.findMany({ where: { clinic_id: clinicId } });
  }

  async findContasPagarByClinic(clinicId: string) {
    return prisma.contas_pagar.findMany({ where: { clinic_id: clinicId } });
  }

  async createAuditLog(data: any) {
    return (prisma as any).audit_logs.create({ data });
  }

  async findModuleCatalogByKey(moduleKey: string) {
    return (prisma as any).module_catalog.findFirst({
      where: { module_key: moduleKey },
    });
  }

  async upsertClinicModule(
    clinicId: string,
    moduleCatalogId: number,
    isActive: boolean
  ) {
    return (prisma as any).clinic_modules.upsert({
      where: {
        clinic_id_module_catalog_id: {
          clinic_id: clinicId,
          module_catalog_id: moduleCatalogId,
        },
      },
      update: { is_active: isActive },
      create: {
        clinic_id: clinicId,
        module_catalog_id: moduleCatalogId,
        is_active: isActive,
      },
    });
  }

  async createProntuario(data: any) {
    return prisma.prontuarios.create({ data });
  }

  async createPepOdontograma(data: any) {
    return prisma.pep_odontograma.create({ data });
  }
}
