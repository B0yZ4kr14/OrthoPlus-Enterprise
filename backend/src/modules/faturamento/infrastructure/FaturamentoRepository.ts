import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";

export class FaturamentoRepository {
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
}
