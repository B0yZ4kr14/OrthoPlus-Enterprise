import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IPdvRepository } from "@/modules/pdv/domain/repositories/IPdvRepository";

export class PdvRepository implements IPdvRepository {
  async createVenda(data: Prisma.pdv_vendasCreateInput) {
    return prisma.pdv_vendas.create({ data });
  }

  async findVendasByClinic(clinicId: string) {
    return prisma.pdv_vendas.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
      take: 50,
    });
  }

  async findVendaById(id: string, clinicId: string) {
    return prisma.pdv_vendas.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateVenda(id: string, data: Prisma.pdv_vendasUpdateInput) {
    return prisma.pdv_vendas.update({ where: { id }, data });
  }
}
