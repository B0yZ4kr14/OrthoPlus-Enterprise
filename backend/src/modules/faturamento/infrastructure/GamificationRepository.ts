import { prisma } from "@/infrastructure/database/prismaClient";
import { IGamificationRepository } from "@/modules/faturamento/domain/repositories/IGamificationRepository";

export class GamificationRepository implements IGamificationRepository {
  async findAllClinics() {
    return prisma.clinics.findMany({ select: { id: true } });
  }

  async findActiveMetas(clinicId: string) {
    return prisma.vendedor_metas.findMany({
      where: {
        clinic_id: clinicId,
      },
    });
  }

  async findVendasByVendedor(
    clinicId: string,
    _vendedorId: string,
    periodoInicio: Date,
    periodoFim: Date,
  ) {
    return prisma.pdv_vendas.findMany({
      where: {
        clinic_id: clinicId,
        status: "FINALIZADA",
        created_at: {
          gte: periodoInicio,
          lte: periodoFim,
        },
      },
      select: { valor_total: true },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateMeta(id: string, data: Record<string, unknown>) {
    return prisma.vendedor_metas.update({ where: { id }, data: data as any });
  }

  async findPremiacao(_clinicId: string, _percentualAtingido: number) {
    // Modelo vendedor_premiacoes nao existe no schema Prisma atual
    return null;
  }

  async findVendasForRanking(clinicId: string, dataInicio: Date) {
    return prisma.pdv_vendas.findMany({
      where: {
        clinic_id: clinicId,
        status: "FINALIZADA",
        created_at: { gte: dataInicio },
      },
      select: { valor_total: true },
    });
  }

  async findRankingEntry(
    clinicId: string,
    vendedorId: string,
    periodo: string,
    _dataReferencia: string,
  ) {
    return prisma.vendedor_ranking.findFirst({
      where: {
        clinic_id: clinicId,
        vendedor_id: vendedorId,
        periodo: periodo,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateRanking(id: string, data: Record<string, unknown>) {
    return prisma.vendedor_ranking.update({ where: { id }, data: data as any });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createRanking(data: Record<string, unknown>) {
    return prisma.vendedor_ranking.create({ data: data as any });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAuditLog(data: Record<string, unknown>) {
    return prisma.audit_logs.create({ data: data as any });
  }
}
