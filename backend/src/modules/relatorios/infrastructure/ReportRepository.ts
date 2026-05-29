import { prisma } from "@/infrastructure/database/prismaClient";
import { IReportRepository } from "@/modules/relatorios/domain/repositories/IReportRepository";

export class ReportRepository implements IReportRepository {
  async findProfileById(id: string) {
    return prisma.profiles.findUnique({ where: { id } });
  }

  async findClinicModules(clinicId: string) {
    return prisma.clinic_modules.findMany({
      where: { clinic_id: clinicId },
    });
  }

  async findModuleCatalogs(ids: number[]) {
    if (ids.length === 0) return [];
    return prisma.module_catalog.findMany({
      where: { id: { in: ids } },
    });
  }

  async findPatientsByClinic(clinicId: string) {
    return prisma.patients.findMany({
      where: { clinic_id: clinicId },
      select: {
        id: true,
        cpf: true,
        full_name: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findWikiPageVersions(take = 100) {
    return prisma.wiki_page_versions.findMany({ take });
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
    return prisma.audit_logs.create({ data });
  }

  async findModuleCatalogByKey(moduleKey: string) {
    return prisma.module_catalog.findFirst({
      where: { module_key: moduleKey },
    });
  }

  async upsertClinicModule(
    clinicId: string,
    moduleCatalogId: number,
    isActive: boolean,
  ) {
    const existing = await prisma.clinic_modules.findFirst({
      where: { clinic_id: clinicId, module_catalog_id: moduleCatalogId },
    });
    if (existing) {
      return prisma.clinic_modules.update({
        where: { id: existing.id },
        data: { is_active: isActive },
      });
    }
    return prisma.clinic_modules.create({
      data: {
        clinic_id: clinicId,
        module_catalog_id: moduleCatalogId,
        is_active: isActive,
        subscribed_at: new Date().toISOString(),
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
