import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IFaturamentoRepository } from "@/modules/faturamento/domain/repositories/IFaturamentoRepository";

export class FaturamentoRepository implements IFaturamentoRepository {
  async createNFe(data: Prisma.nfe_recordsCreateInput) {
    return prisma.nfe_records.create({ data });
  }

  async findNFesByClinic(clinicId: string) {
    return prisma.nfe_records.findMany({ where: { clinic_id: clinicId } });
  }

  async updateNFeStatus(
    id: string,
    data: Prisma.nfe_recordsUpdateManyMutationInput
  ) {
    return prisma.nfe_records.updateMany({ where: { id }, data });
  }

  async getConfig(clinicId: string) {
    return (prisma as any).faturamento_config.findUnique({ where: { clinic_id: clinicId } });
  }

  async upsertConfig(clinicId: string, data: any) {
    return (prisma as any).faturamento_config.upsert({
      where: { clinic_id: clinicId },
      update: data,
      create: { clinic_id: clinicId, ...data },
    });
  }
}
