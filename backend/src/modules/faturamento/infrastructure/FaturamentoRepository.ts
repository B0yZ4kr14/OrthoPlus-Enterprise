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

  async getRelatorio(clinicId: string, filters: { dataInicio?: string; dataFim?: string; tipo?: string }) {
    const where: any = { clinic_id: clinicId };
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.dataInicio || filters.dataFim) {
      where.data_emissao = {};
      if (filters.dataInicio) where.data_emissao.gte = filters.dataInicio;
      if (filters.dataFim) where.data_emissao.lte = filters.dataFim;
    }
    return (prisma as any).notas_fiscais.findMany({
      where,
      orderBy: { data_emissao: 'desc' },
    });
  }
}
