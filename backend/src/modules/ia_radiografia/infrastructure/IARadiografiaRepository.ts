import { prisma } from "@/infrastructure/database/prismaClient";
import { TipoConsentimentoIA } from "@prisma/client";
import { IIARadiografiaRepository } from "@/modules/ia_radiografia/domain/repositories/IIARadiografiaRepository";

export class IARadiografiaRepository implements IIARadiografiaRepository {
  // ── Analise ───────────────────────────────────────────────────────────

  async createAnalise(data: any) {
    return prisma.ia_radiografia_analise.create({ data });
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

  async updateAnalise(id: string, data: any) {
    return prisma.ia_radiografia_analise.update({ where: { id }, data });
  }

  async countAnalises(where: any) {
    return prisma.ia_radiografia_analise.count({ where });
  }

  async aggregateConfidence(where: any) {
    return prisma.ia_radiografia_analise.aggregate({
      where: { ...where, confidence_score: { not: null } },
      _avg: { confidence_score: true },
    });
  }

  async aggregateProcessingTime(where: any) {
    return prisma.ia_radiografia_analise.aggregate({
      where: { ...where, processamento_ms: { not: null } },
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

  async createConsentimento(data: any) {
    return prisma.paciente_consentimento_ia.create({ data });
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

  async updateConsentimento(id: string, data: any) {
    return prisma.paciente_consentimento_ia.update({ where: { id }, data });
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

  // ── Audit Log ─────────────────────────────────────────────────────────

  async createAuditLog(data: any) {
    return prisma.ia_radiografia_audit_log.create({ data });
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
