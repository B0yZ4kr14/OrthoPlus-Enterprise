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

    return this.prisma.clinic_modules.upsert({
      where: {
        clinic_id_module_catalog_id: {
          clinic_id: clinicId,
          module_catalog_id: catalog.id,
        },
      },
      update: { is_active: enabled },
      create: {
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
