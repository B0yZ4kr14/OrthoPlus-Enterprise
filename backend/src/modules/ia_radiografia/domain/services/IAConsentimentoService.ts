import { prisma } from "@/infrastructure/database/prismaClient"
import { TipoConsentimentoIA } from "@prisma/client"
import { RegistrarConsentimentoDTO, RevogarConsentimentoDTO } from "../entities/consentimento"

export class IAConsentimentoService {
  async verificarConsentimento(pacienteId: string, clinicId: string): Promise<boolean> {
    const consentimento = await prisma.paciente_consentimento_ia.findFirst({
      where: {
        paciente_id: pacienteId,
        clinic_id: clinicId,
        tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
        consentido: true,
        revogado: false,
      },
      orderBy: { created_at: "desc" },
    })

    return !!consentimento
  }

  async registrarConsentimento(dto: RegistrarConsentimentoDTO) {
    return prisma.paciente_consentimento_ia.create({
      data: {
        paciente_id: dto.pacienteId,
        clinic_id: dto.clinicId,
        tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
        consentido: dto.consentido,
        data_consentimento: dto.consentido ? new Date() : null,
        ip_consentimento: dto.ipAddress,
        hash_termo: dto.hashTermo,
      },
    })
  }

  async revogarConsentimento(dto: RevogarConsentimentoDTO) {
    const existing = await prisma.paciente_consentimento_ia.findFirst({
      where: {
        paciente_id: dto.pacienteId,
        clinic_id: dto.clinicId,
        tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
        revogado: false,
      },
      orderBy: { created_at: "desc" },
    })

    if (!existing) {
      throw new Error("Consentimento nao encontrado")
    }

    return prisma.paciente_consentimento_ia.update({
      where: { id: existing.id },
      data: {
        revogado: true,
        data_revogacao: new Date(),
        motivo_revogacao: dto.motivo,
      },
    })
  }

  async obterHistoricoConsentimento(pacienteId: string, clinicId: string) {
    return prisma.paciente_consentimento_ia.findMany({
      where: {
        paciente_id: pacienteId,
        clinic_id: clinicId,
        tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
      },
      orderBy: { created_at: "desc" },
    })
  }
}
