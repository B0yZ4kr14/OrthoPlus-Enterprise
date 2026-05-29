import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IOrcamentoRepository } from "@/modules/orcamentos/domain/repositories/IOrcamentoRepository";

export class OrcamentoRepository implements IOrcamentoRepository {
  async listOrcamentos(
    clinicId: string,
    filters?: { patient_id?: string; status?: string },
  ) {
    const where: Prisma.orcamentosWhereInput = { clinic_id: clinicId };
    if (filters?.patient_id) where.patient_id = filters.patient_id;
    if (filters?.status) where.status = filters.status;

    return prisma.orcamentos.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async getOrcamentoById(id: string, clinicId: string) {
    return prisma.orcamentos.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createOrcamento(data: Prisma.orcamentosCreateInput) {
    return prisma.orcamentos.create({ data });
  }

  async updateOrcamento(id: string, data: Prisma.orcamentosUpdateInput) {
    return prisma.orcamentos.update({ where: { id }, data });
  }

  async deleteOrcamento(id: string) {
    return prisma.orcamentos.delete({ where: { id } });
  }

  async listItems(orcamentoId: string) {
    return prisma.orcamento_itens.findMany({
      where: { orcamento_id: orcamentoId },
      orderBy: { ordem: "asc" },
    });
  }

  async addItem(data: Prisma.orcamento_itensCreateInput) {
    return prisma.orcamento_itens.create({ data });
  }
}
