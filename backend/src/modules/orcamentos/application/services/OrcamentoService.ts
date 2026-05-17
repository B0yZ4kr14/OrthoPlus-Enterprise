import { prisma } from "@/infrastructure/database/prismaClient";

export interface CreateOrcamentoInput {
  numero_orcamento: string;
  titulo: string;
  patient_id: string;
  tipo_plano: string;
  validade_dias?: number;
  valor_final?: number;
  desconto_percentual?: number;
  desconto_valor?: number;
  valor_total: number;
  data_validade?: string;
  status?: string;
  observacoes?: string;
  descricao?: string;
  created_by: string;
}

export interface UpdateOrcamentoInput {
  numero_orcamento?: string;
  titulo?: string;
  patient_id?: string;
  tipo_plano?: string;
  validade_dias?: number;
  valor_final?: number;
  desconto_percentual?: number;
  desconto_valor?: number;
  valor_total?: number;
  data_validade?: string;
  status?: string;
  observacoes?: string;
  descricao?: string;
}

export interface AddItemInput {
  procedimento_id?: string;
  descricao: string;
  ordem: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  observacoes?: string;
  dente_codigo?: string;
}

export class OrcamentoService {
  async list(clinicId: string, filters?: { patient_id?: string; status?: string }) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (filters?.patient_id) where.patient_id = filters.patient_id;
    if (filters?.status) where.status = filters.status;

    return prisma.orcamentos.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async getById(id: string, clinicId: string) {
    return prisma.orcamentos.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async create(data: CreateOrcamentoInput, clinicId: string) {
    const validadeDias = data.validade_dias ?? 30;
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + validadeDias);

    return prisma.orcamentos.create({
      data: {
        numero_orcamento: data.numero_orcamento,
        titulo: data.titulo,
        patient_id: data.patient_id,
        tipo_plano: data.tipo_plano,
        clinic_id: clinicId,
        created_by: data.created_by,
        validade_dias: validadeDias,
        data_validade: dataValidade.toISOString(),
        valor_final: data.valor_final ?? data.valor_total,
        valor_total: data.valor_total,
        status: data.status ?? "RASCUNHO",
        desconto_percentual: data.desconto_percentual,
        desconto_valor: data.desconto_valor,
        observacoes: data.observacoes,
        descricao: data.descricao,
      },
    });
  }

  async update(id: string, data: UpdateOrcamentoInput, clinicId: string) {
    const existing = await this.getById(id, clinicId);
    if (!existing) return null;

    return prisma.orcamentos.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async delete(id: string, clinicId: string) {
    const existing = await this.getById(id, clinicId);
    if (!existing) return false;

    await prisma.orcamentos.delete({ where: { id } });
    return true;
  }

  async enviar(id: string, clinicId: string) {
    const existing = await this.getById(id, clinicId);
    if (!existing) return null;
    if (existing.status !== "RASCUNHO") {
      throw new Error("Apenas orçamentos em rascunho podem ser enviados");
    }

    return prisma.orcamentos.update({
      where: { id },
      data: { status: "PENDENTE", updated_at: new Date() },
    });
  }

  async aprovar(id: string, aprovadoPor: string, clinicId: string) {
    const existing = await this.getById(id, clinicId);
    if (!existing) return null;
    if (existing.status !== "PENDENTE") {
      throw new Error("Apenas orçamentos pendentes podem ser aprovados");
    }

    const now = new Date();
    return prisma.orcamentos.update({
      where: { id },
      data: {
        status: "APROVADO",
        aprovado_por: aprovadoPor,
        aprovado_em: now.toISOString(),
        updated_at: now,
      },
    });
  }

  async rejeitar(id: string, _rejeitadoPor: string, motivo: string, clinicId: string) {
    const existing = await this.getById(id, clinicId);
    if (!existing) return null;
    if (existing.status !== "PENDENTE") {
      throw new Error("Apenas orçamentos pendentes podem ser rejeitados");
    }

    const now = new Date();
    return prisma.orcamentos.update({
      where: { id },
      data: {
        status: "REJEITADO",
        rejeitado_em: now.toISOString(),
        motivo_rejeicao: motivo,
        updated_at: now,
      },
    });
  }

  async listItems(orcamentoId: string, clinicId: string) {
    const orcamento = await prisma.orcamentos.findFirst({
      where: { id: orcamentoId, clinic_id: clinicId },
    });
    if (!orcamento) return [];

    return prisma.orcamento_itens.findMany({
      where: { orcamento_id: orcamentoId },
      orderBy: { ordem: "asc" },
    });
  }

  async addItem(orcamentoId: string, data: AddItemInput, clinicId: string) {
    const orcamento = await prisma.orcamentos.findFirst({
      where: { id: orcamentoId, clinic_id: clinicId },
    });
    if (!orcamento) return null;

    return prisma.orcamento_itens.create({
      data: {
        descricao: data.descricao,
        ordem: data.ordem,
        quantidade: data.quantidade,
        valor_unitario: data.valor_unitario,
        valor_total: data.valor_total,
        orcamento_id: orcamentoId,
        procedimento_id: data.procedimento_id,
        observacoes: data.observacoes,
        dente_codigo: data.dente_codigo,
      },
    });
  }
}
