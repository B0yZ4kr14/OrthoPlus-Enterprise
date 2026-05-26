import { prisma } from "@/infrastructure/database/prismaClient";
import { IFidelidadeRepository } from "@/modules/fidelidade/domain/repositories/IFidelidadeRepository";

export class FidelidadeRepository implements IFidelidadeRepository {
  // Pontos
  async findPontosByClinic(clinicId: string, patientId?: string) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (patientId) where.patient_id = patientId;
    return (prisma as any).fidelidade_pontos.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createPonto(data: any) {
    return (prisma as any).fidelidade_pontos.create({ data });
  }

  async upsertPacienteFidelidade(clinicId: string, patientId: string, pontos: number) {
    return (prisma as any).fidelidade_pacientes.upsert({
      where: { clinic_id_patient_id: { clinic_id: clinicId, patient_id: patientId } },
      update: { pontos_acumulados: { increment: pontos }, ultima_atualizacao: new Date() },
      create: { clinic_id: clinicId, patient_id: patientId, pontos_acumulados: pontos, nivel: "BRONZE" },
    });
  }

  async findBadgesByClinic(clinicId: string) {
    return (prisma as any).fidelidade_badges.findMany({
      where: { clinic_id: clinicId, is_active: true },
      orderBy: { pontos_necessarios: "asc" },
    });
  }

  async findPacienteFidelidade(clinicId: string, patientId: string) {
    return (prisma as any).fidelidade_pacientes.findUnique({
      where: { clinic_id_patient_id: { clinic_id: clinicId, patient_id: patientId } },
    });
  }

  async addPointsTransaction(clinicId: string, patientId: string, pontos: number, pontoData: any): Promise<[any, any, any[]]> {
    return prisma.$transaction([
      (prisma as any).fidelidade_pontos.create({
        data: { ...pontoData, clinic_id: clinicId },
      }),
      (prisma as any).fidelidade_pacientes.upsert({
        where: { clinic_id_patient_id: { clinic_id: clinicId, patient_id: patientId } },
        update: { pontos_acumulados: { increment: pontos }, ultima_atualizacao: new Date() },
        create: { clinic_id: clinicId, patient_id: patientId, pontos_acumulados: pontos, nivel: "BRONZE" },
      }),
      (prisma as any).fidelidade_badges.findMany({
        where: { clinic_id: clinicId, is_active: true },
        orderBy: { pontos_necessarios: "asc" },
      }),
    ]);
  }

  // Badges
  async findAllBadgesByClinic(clinicId: string) {
    return (prisma as any).fidelidade_badges.findMany({
      where: { clinic_id: clinicId },
      orderBy: { nome: "asc" },
    });
  }

  async createBadge(data: any) {
    return (prisma as any).fidelidade_badges.create({ data });
  }

  // Recompensas
  async findRecompensasByClinic(clinicId: string, ativo?: boolean) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (ativo !== undefined) where.ativo = ativo;
    return (prisma as any).fidelidade_recompensas.findMany({
      where,
      orderBy: { pontos_necessarios: "asc" },
    });
  }

  async createRecompensa(data: any) {
    return (prisma as any).fidelidade_recompensas.create({ data });
  }

  // Indicacoes
  async findIndicacoesByClinic(clinicId: string, referrerId?: string) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (referrerId) where.referrer_id = referrerId;
    return (prisma as any).fidelidade_indicacoes.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async createIndicacao(data: any) {
    return (prisma as any).fidelidade_indicacoes.create({ data });
  }
}
