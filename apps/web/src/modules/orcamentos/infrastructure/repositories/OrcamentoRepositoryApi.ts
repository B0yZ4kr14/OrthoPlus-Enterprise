import { apiClient } from "@/lib/api/apiClient";
import { Orcamento, StatusOrcamento } from "../../domain/entities/Orcamento";
import { IOrcamentoRepository } from "../../domain/repositories/IOrcamentoRepository";

export class OrcamentoRepositoryApi implements IOrcamentoRepository {
  async findById(id: string): Promise<Orcamento | null> {
    try {
      const data: Record<string, any> = await apiClient.get(`/orcamentos/${id}`);
      return this.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByNumero(
    numeroOrcamento: string,
    clinicId: string,
  ): Promise<Orcamento | null> {
    try {
      const data: Record<string, any> = await apiClient.get("/orcamentos", {
        params: { numero_orcamento: numeroOrcamento, clinic_id: clinicId },
      });
      if (Array.isArray(data) && data.length > 0) return this.toDomain(data[0]);
      if (data && !Array.isArray(data)) return this.toDomain(data);
      return null;
    } catch {
      return null;
    }
  }

  async findByPatientId(
    patientId: string,
    clinicId: string,
  ): Promise<Orcamento[]> {
    try {
      const data: Record<string, any> = await apiClient.get("/orcamentos", {
        params: {
          patient_id: patientId,
          clinic_id: clinicId,
          sort: "created_at.desc",
        },
      });
      return data.map((item: Record<string, any>) => this.toDomain(item));
    } catch {
      return [];
    }
  }

  async findByClinicId(clinicId: string): Promise<Orcamento[]> {
    try {
      const data: Record<string, any> = await apiClient.get("/orcamentos", {
        params: { clinic_id: clinicId, sort: "created_at.desc" },
      });
      return data.map((item: Record<string, any>) => this.toDomain(item));
    } catch {
      return [];
    }
  }

  async findByStatus(
    clinicId: string,
    status: StatusOrcamento,
  ): Promise<Orcamento[]> {
    try {
      const data: Record<string, any> = await apiClient.get("/orcamentos", {
        params: { clinic_id: clinicId, status, sort: "created_at.desc" },
      });
      return data.map((item: Record<string, any>) => this.toDomain(item));
    } catch {
      return [];
    }
  }

  async findPendentes(clinicId: string): Promise<Orcamento[]> {
    return this.findByStatus(clinicId, "PENDENTE");
  }

  async findExpirados(clinicId: string): Promise<Orcamento[]> {
    try {
      const data: Record<string, any> = await apiClient.get("/orcamentos", {
        params: {
          clinic_id: clinicId,
          status: "PENDENTE",
          is_expired: "true",
          sort: "data_expiracao.asc",
        },
      });
      return data.map((item: Record<string, any>) => this.toDomain(item));
    } catch {
      return [];
    }
  }

  async save(orcamento: Orcamento): Promise<void> {
    const data = this.toPersistence(orcamento);
    await apiClient.post("/orcamentos", data);
  }

  async update(orcamento: Orcamento): Promise<void> {
    const data = this.toPersistence(orcamento);
    await apiClient.put(`/orcamentos/${orcamento.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orcamentos/${id}`);
  }

  private toDomain(data: unknown): Orcamento {
    return Orcamento.restore({
      // @ts-expect-error — TS18046
      id: data.id,
      // @ts-expect-error — TS18046
      numeroOrcamento: data.numero_orcamento,
      // @ts-expect-error — TS18046
      clinicId: data.clinic_id,
      // @ts-expect-error — TS18046
      patientId: data.patient_id,
      // @ts-expect-error — TS18046
      createdBy: data.created_by,
      // @ts-expect-error — TS18046
      titulo: data.titulo,
      // @ts-expect-error — TS18046
      descricao: data.descricao,
      // @ts-expect-error — TS18046
      tipoPlano: data.tipo_plano,
      // @ts-expect-error — TS18046
      validadeDias: data.validade_dias,
      // @ts-expect-error — TS18046
      dataExpiracao: new Date(data.data_expiracao),
      // @ts-expect-error — TS18046
      status: data.status as StatusOrcamento,
      // @ts-expect-error — TS18046
      valorSubtotal: data.valor_subtotal,
      // @ts-expect-error — TS18046
      descontoPercentual: data.desconto_percentual,
      // @ts-expect-error — TS18046
      descontoValor: data.desconto_valor,
      // @ts-expect-error — TS18046
      valorTotal: data.valor_total,
      // @ts-expect-error — TS18046
      observacoes: data.observacoes,
      // @ts-expect-error — TS18046
      aprovadoPor: data.aprovado_por,
      // @ts-expect-error — TS18046
      aprovadoEm: data.aprovado_em ? new Date(data.aprovado_em) : undefined,
      // @ts-expect-error — TS18046
      rejeitadoPor: data.rejeitado_por,
      // @ts-expect-error — TS18046
      rejeitadoEm: data.rejeitado_em ? new Date(data.rejeitado_em) : undefined,
      // @ts-expect-error — TS18046
      motivoRejeicao: data.motivo_rejeicao,
      // @ts-expect-error — TS18046
      convertidoContrato: data.convertido_contrato,
      // @ts-expect-error — TS18046
      contratoId: data.contrato_id,
      // @ts-expect-error — TS18046
      createdAt: new Date(data.created_at),
      // @ts-expect-error — TS18046
      updatedAt: new Date(data.updated_at),
    });
  }

  private toPersistence(orcamento: Orcamento): unknown {
    return {
      id: orcamento.id,
      numero_orcamento: orcamento.numeroOrcamento,
      clinic_id: orcamento.clinicId,
      patient_id: orcamento.patientId,
      created_by: orcamento.createdBy,
      titulo: orcamento.titulo,
      descricao: orcamento.descricao,
      tipo_plano: orcamento.tipoPlano,
      validade_dias: orcamento.validadeDias,
      data_expiracao: orcamento.dataExpiracao.toISOString(),
      status: orcamento.status,
      valor_subtotal: orcamento.valorSubtotal,
      desconto_percentual: orcamento.descontoPercentual,
      desconto_valor: orcamento.descontoValor,
      valor_total: orcamento.valorTotal,
      observacoes: orcamento.observacoes,
      aprovado_por: orcamento.aprovadoPor,
      aprovado_em: orcamento.aprovadoEm?.toISOString(),
      rejeitado_por: orcamento.rejeitadoPor,
      rejeitado_em: orcamento.rejeitadoEm?.toISOString(),
      motivo_rejeicao: orcamento.motivoRejeicao,
      convertido_contrato: orcamento.convertidoContrato,
      contrato_id: orcamento.contratoId,
      created_at: orcamento.createdAt.toISOString(),
      updated_at: orcamento.updatedAt.toISOString(),
    };
  }
}
