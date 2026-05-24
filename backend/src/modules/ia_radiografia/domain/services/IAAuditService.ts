import { prisma } from "@/infrastructure/database/prismaClient"
import { Prisma } from "@prisma/client"
import { RegistrarAcaoAuditDTO } from "../entities/audit"

export class IAAuditService {
  async registrarAcao(dto: RegistrarAcaoAuditDTO) {
    return prisma.ia_radiografia_audit_log.create({
      data: {
        analise_id: dto.analiseId,
        clinic_id: dto.clinicId,
        paciente_id: dto.pacienteId,
        dentista_id: dto.dentistaId,
        acao: dto.acao,
        ip_address: dto.ipAddress,
        user_agent: dto.userAgent,
        detalhes: (dto.detalhes ?? {}) as Prisma.InputJsonValue,
      },
    })
  }

  async obterAuditoriaPorAnalise(analiseId: string) {
    return prisma.ia_radiografia_audit_log.findMany({
      where: { analise_id: analiseId },
      orderBy: { timestamp: "desc" },
    })
  }

  async obterAuditoriaPorPaciente(pacienteId: string, clinicId: string) {
    return prisma.ia_radiografia_audit_log.findMany({
      where: {
        paciente_id: pacienteId,
        clinic_id: clinicId,
      },
      orderBy: { timestamp: "desc" },
    })
  }
}
