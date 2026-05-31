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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPonto(data: Record<string, unknown>) {
    return prisma.fidelidade_pontos.create({ data: data as any });
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
    pontoData: Record<string, unknown>,
  ): Promise<[any, any, any[]]> {
    const existing = await prisma.fidelidade_pacientes.findFirst({
      where: { clinic_id: clinicId, patient_id: patientId },
    });
    return prisma.$transaction([
      prisma.fidelidade_pontos.create({
        data: { ...(pontoData as any), clinic_id: clinicId },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createBadge(data: Record<string, unknown>) {
    return prisma.fidelidade_badges.create({ data: data as any });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createRecompensa(data: Record<string, unknown>) {
    return prisma.fidelidade_recompensas.create({ data: data as any });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createIndicacao(data: Record<string, unknown>) {
    return prisma.fidelidade_indicacoes.create({ data: data as any });
  }
}
