import { TipoConsentimentoIA } from "@prisma/client";
import {
  RegistrarConsentimentoDTO,
  RevogarConsentimentoDTO,
} from "../entities/consentimento";
import { IIARadiografiaRepository } from "../repositories/IIARadiografiaRepository";
import { IARadiografiaRepository } from "../../infrastructure/IARadiografiaRepository";

export class IAConsentimentoService {
  constructor(
    private repo: IIARadiografiaRepository = new IARadiografiaRepository(),
  ) {}

  async verificarConsentimento(
    pacienteId: string,
    clinicId: string,
  ): Promise<boolean> {
    const consentimento = await this.repo.findConsentimento(
      pacienteId,
      clinicId,
    );
    return !!consentimento;
  }

  async registrarConsentimento(dto: RegistrarConsentimentoDTO) {
    return this.repo.createConsentimento({
      paciente_id: dto.pacienteId,
      clinic_id: dto.clinicId,
      tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
      consentido: dto.consentido,
      data_consentimento: dto.consentido ? new Date() : null,
      ip_consentimento: dto.ipAddress,
      hash_termo: dto.hashTermo,
    });
  }

  async revogarConsentimento(dto: RevogarConsentimentoDTO) {
    const existing = await this.repo.findConsentimentoToRevoke(
      dto.pacienteId,
      dto.clinicId,
    );

    if (!existing) {
      throw new Error("Consentimento nao encontrado");
    }

    return this.repo.updateConsentimento(existing.id, dto.clinicId, {
      revogado: true,
      data_revogacao: new Date(),
      motivo_revogacao: dto.motivo,
    });
  }

  async obterHistoricoConsentimento(pacienteId: string, clinicId: string) {
    return this.repo.findHistoricoConsentimento(pacienteId, clinicId);
  }
}
