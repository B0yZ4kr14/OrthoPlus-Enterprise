import { AcaoAuditIA } from "@prisma/client"

export interface RegistrarAcaoAuditDTO {
  analiseId?: string
  clinicId: string
  pacienteId: string
  dentistaId: string
  acao: AcaoAuditIA
  ipAddress?: string
  userAgent?: string
  detalhes?: Record<string, unknown>
}
