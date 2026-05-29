import { prisma } from "@/infrastructure/database/prismaClient";
import { IFidelidadeRepository } from "@/modules/fidelidade/domain/repositories/IFidelidadeRepository";

export class FidelidadeRepository implements IFidelidadeRepository {
  // Pontos
  async findPontosByClinic(clinicId: string, patientId?: string) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (patientId) where.patient_id = patientId;
    return prisma.fidelidade_pontos.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createPonto(data: any) {
    return prisma.fidelidade_pontos.create({ data });
  }

  async upsertPacienteFidelidade(
    clinicId: string,
    patientId: string,
    pontos: number,
  ) {
    const existing = await prisma.fidelidade_pacientes.findFirst({
      where: { clinic_id: clinicId, patient_id: patientId },
    });
    if (existing) {
      return prisma.fidelidade_pacientes.update({
        where: { id: existing.id },
        data: {
          pontos_acumulados: { increment: pontos },
          ultima_atualizacao: new Date(),
        },
      });
    }
    return prisma.fidelidade_pacientes.create({
      data: {
        clinic_id: clinicId,
        patient_id: patientId,
        pontos_acumulados: pontos,
        nivel: "BRONZE",
      },
    });
  }

  async findBadgesByClinic(clinicId: string) {
    return prisma.fidelidade_badges.findMany({
      where: { clinic_id: clinicId },
      orderBy: { name: "asc" },
    });
  }

  async findPacienteFidelidade(clinicId: string, patientId: string) {
    return prisma.fidelidade_pacientes.findFirst({
      where: { clinic_id: clinicId, patient_id: patientId },
    });
  }

  async addPointsTransaction(
    clinicId: string,
    patientId: string,
    pontos: number,
    pontoData: any,
  ): Promise<[any, any, any[]]> {
    const existing = await prisma.fidelidade_pacientes.findFirst({
      where: { clinic_id: clinicId, patient_id: patientId },
    });
    return prisma.$transaction([
      prisma.fidelidade_pontos.create({
        data: { ...pontoData, clinic_id: clinicId },
      }),
      existing
        ? prisma.fidelidade_pacientes.update({
            where: { id: existing.id },
            data: {
              pontos_acumulados: { increment: pontos },
              ultima_atualizacao: new Date(),
            },
          })
        : prisma.fidelidade_pacientes.create({
            data: {
              clinic_id: clinicId,
              patient_id: patientId,
              pontos_acumulados: pontos,
              nivel: "BRONZE",
            },
          }),
      prisma.fidelidade_badges.findMany({
        where: { clinic_id: clinicId },
        orderBy: { name: "asc" },
      }),
    ]);
  }

  // Badges
  async findAllBadgesByClinic(clinicId: string) {
    return prisma.fidelidade_badges.findMany({
      where: { clinic_id: clinicId },
      orderBy: { name: "asc" },
    });
  }

  async createBadge(data: any) {
    return prisma.fidelidade_badges.create({ data });
  }

  // Recompensas
  async findRecompensasByClinic(clinicId: string, ativo?: boolean) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (ativo !== undefined) where.is_active = ativo;
    return prisma.fidelidade_recompensas.findMany({
      where,
      orderBy: { points_cost: "asc" },
    });
  }

  async createRecompensa(data: any) {
    return prisma.fidelidade_recompensas.create({ data });
  }

  // Indicacoes
  async findIndicacoesByClinic(clinicId: string, referrerId?: string) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (referrerId) where.referrer_id = referrerId;
    return prisma.fidelidade_indicacoes.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createIndicacao(data: any) {
    return prisma.fidelidade_indicacoes.create({ data });
  }
}
