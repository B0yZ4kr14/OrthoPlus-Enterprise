import { prisma } from "@/infrastructure/database/prismaClient";
import { ILGPDRepository } from "../domain/repositories/ILGPDRepository";

export class LGPDRepository implements ILGPDRepository {
  async findManyConsentimentos(where: Record<string, unknown>) {
    return prisma.lgpd_data_consents.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createConsentimento(data: Record<string, unknown>) {
    return prisma.lgpd_data_consents.create({ data: data as any });
  }

  async findManySolicitacoes(where: Record<string, unknown>) {
    return prisma.lgpd_data_requests.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createSolicitacao(data: Record<string, unknown>) {
    return prisma.lgpd_data_requests.create({ data: data as any });
  }

  async findSolicitacaoById(id: string, clinicId: string) {
    return prisma.lgpd_data_requests.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateSolicitacao(id: string, data: Record<string, unknown>) {
    return prisma.lgpd_data_requests.update({
      where: { id },
      data: data as any,
    });
  }
}
