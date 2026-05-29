import { Prisma } from "@prisma/client";
import { RegistrarAcaoAuditDTO } from "../entities/audit";
import { IIARadiografiaRepository } from "../repositories/IIARadiografiaRepository";
import { IARadiografiaRepository } from "../../infrastructure/IARadiografiaRepository";

export class IAAuditService {
  constructor(
    private repo: IIARadiografiaRepository = new IARadiografiaRepository(),
  ) {}

  async registrarAcao(dto: RegistrarAcaoAuditDTO) {
    return this.repo.createAuditLog({
      analise_id: dto.analiseId,
      clinic_id: dto.clinicId,
      paciente_id: dto.pacienteId,
      dentista_id: dto.dentistaId,
      acao: dto.acao,
      ip_address: dto.ipAddress,
      user_agent: dto.userAgent,
      detalhes: (dto.detalhes ?? {}) as Prisma.InputJsonValue,
    });
  }

  async obterAuditoriaPorAnalise(analiseId: string) {
    return this.repo.findAuditLogsByAnalise(analiseId);
  }

  async obterAuditoriaPorPaciente(pacienteId: string, clinicId: string) {
    return this.repo.findAuditLogsByPaciente(pacienteId, clinicId);
  }
}
