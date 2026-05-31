import { prisma } from "@/infrastructure/database/prismaClient";
import { TipoConsentimentoIA } from "@prisma/client";
import { IIARadiografiaRepository } from "@/modules/ia_radiografia/domain/repositories/IIARadiografiaRepository";

export class IARadiografiaRepository implements IIARadiografiaRepository {
  // ── Analise ───────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAnalise(data: Record<string, unknown>) {
    return prisma.ia_radiografia_analise.create({ data: data as any });
  }

  async findAnalisesByClinic(clinicId: string) {
    return prisma.ia_radiografia_analise.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        paciente_id: true,
        tipo_radiografia: true,
        status: true,
        confidence_score: true,
        revisada: true,
        created_at: true,
      },
    });
  }

  async findAnaliseById(id: string, clinicId: string) {
    return prisma.ia_radiografia_analise.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async findAnaliseByIdOnly(id: string) {
    return prisma.ia_radiografia_analise.findUnique({
      where: { id },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateAnalise(id: string, data: Record<string, unknown>) {
    return prisma.ia_radiografia_analise.update({ where: { id }, data: data as any });
  }

  async countAnalises(where: Record<string, unknown>) {
    return prisma.ia_radiografia_analise.count({ where: where as any });
  }

  async aggregateConfidence(where: Record<string, unknown>) {
    return prisma.ia_radiografia_analise.aggregate({
      where: { ...(where as any), confidence_score: { not: null } },
      _avg: { confidence_score: true },
    });
  }

  async aggregateProcessingTime(where: Record<string, unknown>) {
    return prisma.ia_radiografia_analise.aggregate({
      where: { ...(where as any), processamento_ms: { not: null } },
      _avg: { processamento_ms: true },
    });
  }

  // ── Consentimento ─────────────────────────────────────────────────────

  async findConsentimento(pacienteId: string, clinicId: string) {
    return prisma.paciente_consentimento_ia.findFirst({
      where: {
        paciente_id: pacienteId,
        clinic_id: clinicId,
        tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
        consentido: true,
        revogado: false,
      },
      orderBy: { created_at: "desc" },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createConsentimento(data: Record<string, unknown>) {
    return prisma.paciente_consentimento_ia.create({ data: data as any });
  }

  async findConsentimentoToRevoke(pacienteId: string, clinicId: string) {
    return prisma.paciente_consentimento_ia.findFirst({
      where: {
        paciente_id: pacienteId,
        clinic_id: clinicId,
        tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
        revogado: false,
      },
      orderBy: { created_at: "desc" },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateConsentimento(id: string, data: Record<string, unknown>) {
    return prisma.paciente_consentimento_ia.update({ where: { id }, data: data as any });
  }

  async findHistoricoConsentimento(pacienteId: string, clinicId: string) {
    return prisma.paciente_consentimento_ia.findMany({
      where: {
        paciente_id: pacienteId,
        clinic_id: clinicId,
        tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
      },
      orderBy: { created_at: "desc" },
    });
  }

  // ── Model Config ──────────────────────────────────────────────────────

  async findModelConfigByClinic(clinicId: string) {
    return prisma.ia_modelo_config.findUnique({
      where: { clinic_id: clinicId },
    });
  }

  // ── Problemas ──────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createProblemasRadiograficos(data: Record<string, unknown>[]) {
    return prisma.problema_radiografico.createMany({ data: data as any });
  }

  // ── Audit Log ─────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAuditLog(data: Record<string, unknown>) {
    return prisma.ia_radiografia_audit_log.create({ data: data as any });
  }

  async findAuditLogsByAnalise(analiseId: string) {
    return prisma.ia_radiografia_audit_log.findMany({
      where: { analise_id: analiseId },
      orderBy: { timestamp: "desc" },
    });
  }

  async findAuditLogsByPaciente(pacienteId: string, clinicId: string) {
    return prisma.ia_radiografia_audit_log.findMany({
      where: {
        paciente_id: pacienteId,
        clinic_id: clinicId,
      },
      orderBy: { timestamp: "desc" },
    });
  }
}
