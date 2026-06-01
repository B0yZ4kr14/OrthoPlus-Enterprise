import { apiClient } from "@/lib/api/apiClient";
import { Orcamento, StatusOrcamento } from "../../domain/entities/Orcamento";
import { IOrcamentoRepository } from "../../domain/repositories/IOrcamentoRepository";

interface RawOrcamento {
  id: string;
  numero_orcamento: string;
  clinic_id: string;
  patient_id: string;
  created_by: string;
  titulo: string;
  descricao?: string;
  tipo_plano: string;
  validade_dias: number;
  data_expiracao: string;
  status: string;
  valor_subtotal: number;
  desconto_percentual?: number;
  desconto_valor?: number;
  valor_total: number;
  observacoes?: string;
  aprovado_por?: string;
  aprovado_em?: string;
  rejeitado_por?: string;
  rejeitado_em?: string;
  motivo_rejeicao?: string;
  convertido_contrato: boolean;
  contrato_id?: string;
  created_at: string;
  updated_at: string;
}

export class OrcamentoRepositoryApi implements IOrcamentoRepository {
  async findById(id: string): Promise<Orcamento | null> {
    try {
      const data = await apiClient.get<RawOrcamento>(`/orcamentos/${id}`);
      return this.toDomain(data);
    } catch (error) {
      console.error("[OrcamentoRepositoryApi.findById] failed:", error);
      return null;
    }
  }

  async findByNumero(
    numeroOrcamento: string,
    clinicId: string,
  ): Promise<Orcamento | null> {
    try {
      const data = await apiClient.get<RawOrcamento[]>("/orcamentos", {
        params: { numero_orcamento: numeroOrcamento, clinic_id: clinicId },
      });
      if (Array.isArray(data) && data.length > 0) return this.toDomain(data[0]);
      if (data && !Array.isArray(data)) return this.toDomain(data);
      return null;
    } catch (error) {
      console.error("[OrcamentoRepositoryApi.findByNumero] failed:", error);
      return null;
    }
  }

  async findByPatientId(
    patientId: string,
    clinicId: string,
  ): Promise<Orcamento[]> {
    try {
      const data = await apiClient.get<RawOrcamento[]>("/orcamentos", {
        params: {
          patient_id: patientId,
          clinic_id: clinicId,
          sort: "created_at.desc",
        },
      });
      return data.map((item) => this.toDomain(item));
    } catch (error) {
      console.error("[OrcamentoRepositoryApi.findByPatientId] failed:", error);
      return [];
    }
  }

  async findByClinicId(clinicId: string): Promise<Orcamento[]> {
    try {
      const data = await apiClient.get<RawOrcamento[]>("/orcamentos", {
        params: { clinic_id: clinicId, sort: "created_at.desc" },
      });
      return data.map((item) => this.toDomain(item));
    } catch (error) {
      console.error("[OrcamentoRepositoryApi.findByClinicId] failed:", error);
      return [];
    }
  }

  async findByStatus(
    clinicId: string,
    status: StatusOrcamento,
  ): Promise<Orcamento[]> {
    try {
      const data = await apiClient.get<RawOrcamento[]>("/orcamentos", {
        params: { clinic_id: clinicId, status, sort: "created_at.desc" },
      });
      return data.map((item) => this.toDomain(item));
    } catch (error) {
      console.error("[OrcamentoRepositoryApi.findByStatus] failed:", error);
      return [];
    }
  }

  async findPendentes(clinicId: string): Promise<Orcamento[]> {
    return this.findByStatus(clinicId, "PENDENTE");
  }

  async findExpirados(clinicId: string): Promise<Orcamento[]> {
    try {
      const data = await apiClient.get<RawOrcamento[]>("/orcamentos", {
        params: {
          clinic_id: clinicId,
          status: "PENDENTE",
          is_expired: "true",
          sort: "data_expiracao.asc",
        },
      });
      return data.map((item) => this.toDomain(item));
    } catch (error) {
      console.error("[OrcamentoRepositoryApi.findExpirados] failed:", error);
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

  private toDomain(data: RawOrcamento): Orcamento {
    return Orcamento.restore({
      id: data.id,
      numeroOrcamento: data.numero_orcamento,
      clinicId: data.clinic_id,
      patientId: data.patient_id,
      createdBy: data.created_by,
      titulo: data.titulo,
      descricao: data.descricao,
      tipoPlano: data.tipo_plano,
      validadeDias: data.validade_dias,
      dataExpiracao: new Date(data.data_expiracao),
      status: data.status as StatusOrcamento,
      valorSubtotal: data.valor_subtotal,
      descontoPercentual: data.desconto_percentual,
      descontoValor: data.desconto_valor,
      valorTotal: data.valor_total,
      observacoes: data.observacoes,
      aprovadoPor: data.aprovado_por,
      aprovadoEm: data.aprovado_em ? new Date(data.aprovado_em) : undefined,
      rejeitadoPor: data.rejeitado_por,
      rejeitadoEm: data.rejeitado_em ? new Date(data.rejeitado_em) : undefined,
      motivoRejeicao: data.motivo_rejeicao,
      convertidoContrato: data.convertido_contrato,
      contratoId: data.contrato_id,
      createdAt: new Date(data.created_at),
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
