import { prisma } from "@/infrastructure/database/prismaClient";
import { IGamificationRepository } from "@/modules/faturamento/domain/repositories/IGamificationRepository";

export class GamificationRepository implements IGamificationRepository {
  async findAllClinics() {
    return prisma.clinics.findMany({ select: { id: true } });
  }

  async findActiveMetas(clinicId: string) {
    return (prisma as any).vendedor_metas.findMany({
      where: {
        clinic_id: clinicId,
        status: "EM_ANDAMENTO",
        periodo_inicio: { lte: new Date() },
        periodo_fim: { gte: new Date() },
      },
    });
  }

  async findVendasByVendedor(clinicId: string, vendedorId: string, periodoInicio: Date, periodoFim: Date) {
    return (prisma as any).pdv_vendas.findMany({
      where: {
        clinic_id: clinicId,
        created_by: vendedorId,
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
    return (prisma as any).vendedor_metas.update({ where: { id }, data });
  }

  async findPremiacao(clinicId: string, percentualAtingido: number) {
    return (prisma as any).vendedor_premiacoes.findFirst({
      where: {
        clinic_id: clinicId,
        ativo: true,
        percentual_meta_minimo: { lte: percentualAtingido },
      },
      orderBy: { percentual_meta_minimo: "desc" },
    });
  }

  async findVendasForRanking(clinicId: string, dataInicio: Date) {
    return (prisma as any).pdv_vendas.findMany({
      where: {
        clinic_id: clinicId,
        status: "FINALIZADA",
        created_at: { gte: dataInicio },
      },
      select: { created_by: true, valor_total: true },
    });
  }

  async findRankingEntry(clinicId: string, vendedorId: string, periodo: string, dataReferencia: string) {
    return (prisma as any).vendedor_ranking.findFirst({
      where: {
        clinic_id: clinicId,
        vendedor_id: vendedorId,
        periodo: periodo,
        data_referencia: dataReferencia,
      },
    });
  }

  async updateRanking(id: string, data: any) {
    return (prisma as any).vendedor_ranking.update({ where: { id }, data });
  }

  async createRanking(data: any) {
    return (prisma as any).vendedor_ranking.create({ data });
  }

  async createAuditLog(data: any) {
    return (prisma as any).audit_logs.create({ data });
  }
}
