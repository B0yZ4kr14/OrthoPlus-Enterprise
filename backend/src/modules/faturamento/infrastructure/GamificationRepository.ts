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

  async updateMeta(id: string, data: any) {
    return prisma.vendedor_metas.update({ where: { id }, data });
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

  async updateRanking(id: string, data: any) {
    return prisma.vendedor_ranking.update({ where: { id }, data });
  }

  async createRanking(data: any) {
    return prisma.vendedor_ranking.create({ data });
  }

  async createAuditLog(data: any) {
    return prisma.audit_logs.create({ data });
  }
}
