import { PrismaClient } from "@prisma/client";

export class ClinicModuleRepository {
  constructor(private prisma: PrismaClient) {}

  async toggle(clinicId: string, moduleKey: string, enabled: boolean) {
    const catalog = await this.prisma.module_catalog.findFirst({
      where: { module_key: moduleKey },
    });

    if (!catalog) {
      throw new Error(`Module catalog not found for key: ${moduleKey}`);
    }

    const existing = await this.prisma.clinic_modules.findFirst({
      where: {
        clinic_id: clinicId,
        module_catalog_id: catalog.id,
      },
    });

    if (existing) {
      return this.prisma.clinic_modules.update({
        where: { id: existing.id },
        data: { is_active: enabled },
      });
    }

    return this.prisma.clinic_modules.create({
      data: {
        clinic_id: clinicId,
        module_catalog_id: catalog.id,
        is_active: enabled,
        subscribed_at: new Date().toISOString(),
      },
    });
  }

  async listByClinic(clinicId: string) {
    return this.prisma.clinic_modules.findMany({
      where: { clinic_id: clinicId },
      include: { module_catalog: true },
    });
  }
}
