import { prisma } from "@/infrastructure/database/prismaClient";
import { ISplitPagamentoRepository } from "../domain/repositories/ISplitPagamentoRepository";

export class SplitPagamentoRepository implements ISplitPagamentoRepository {
  async findManyConfig(clinicId: string) {
    return prisma.split_payment_config.findMany({
      where: { clinic_id: clinicId },
    });
  }

  async findConfigByClinic(clinicId: string) {
    return prisma.split_payment_config.findFirst({
      where: { clinic_id: clinicId },
    });
  }

  async updateConfig(id: string, clinicId: string, data: Record<string, unknown>) {
    return prisma.split_payment_config.update({ where: { id, clinic_id: clinicId }, data });
  }

  async createConfig(data: Record<string, unknown>) {
    return prisma.split_payment_config.create({ data: data as any });
  }

  async findManyComissoes(where: Record<string, unknown>) {
    return prisma.split_comissoes.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createComissao(data: Record<string, unknown>) {
    return prisma.split_comissoes.create({ data: data as any });
  }

  async findManyTransacoes(where: Record<string, unknown>) {
    return prisma.split_transactions.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createTransacao(data: Record<string, unknown>) {
    return prisma.split_transactions.create({ data: data as any });
  }

  async findConfigByProfessional(
    clinicId: string,
    professionalId: string,
    procedureType?: string,
  ) {
    const where: Record<string, unknown> = {
      clinic_id: clinicId,
      professional_id: professionalId,
      is_active: true,
    };
    if (procedureType) where.procedure_type = procedureType;
    return prisma.split_payment_config.findFirst({ where });
  }
}
