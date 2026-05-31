import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IFinanceiroRepository } from "@/modules/financeiro/domain/repositories/IFinanceiroRepository";

/**
 * FinanceiroRepository — encapsulates all database access for the financeiro module.
 * Replaces direct Prisma calls in FinanceiroController.
 */

// ─── Types for filter params ───

export interface TransactionFilters {
  clinicId: string;
  type?: string;
  status?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

export interface CategoryFilters {
  clinicId: string;
  type?: string;
  isActive?: boolean;
  name?: string;
}

export interface CashRegisterFilters {
  clinicId: string;
  status?: string;
  openedBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface MovimentoFilters {
  clinicId: string;
  status?: string;
  tipo?: string;
  startDate?: string;
  endDate?: string;
}

export interface IncidenteFilters {
  clinicId: string;
  tipoIncidente?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExtratoFilters {
  clinicId: string;
  conciliado?: boolean;
}

export interface VendaFilters {
  clinicId: string;
  startDate?: string;
}

// ─── Repository ───

export class FinanceiroRepository implements IFinanceiroRepository {
  // ─── financial_transactions ───

  async listTransactions(filters: TransactionFilters) {
    const where: Prisma.financial_transactionsWhereInput = {
      clinic_id: filters.clinicId,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category_id: filters.category }),
      ...(filters.paymentMethod && { payment_method: filters.paymentMethod }),
      ...(filters.startDate || filters.endDate
        ? {
            transaction_date: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    };

    return prisma.financial_transactions.findMany({
      where,
      orderBy: { transaction_date: "desc" },
    });
  }

  async getTransaction(id: string, clinicId: string) {
    return prisma.financial_transactions.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createTransaction(data: Prisma.financial_transactionsCreateInput) {
    return prisma.financial_transactions.create({ data });
  }

  async updateTransaction(
    id: string,
    data: Prisma.financial_transactionsUpdateInput,
  ) {
    return prisma.financial_transactions.update({ where: { id }, data });
  }

  async deleteTransaction(id: string) {
    return prisma.financial_transactions.delete({ where: { id } });
  }

  async aggregateTransactions(
    clinicId: string,
    type: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    return prisma.financial_transactions.aggregate({
      where: {
        clinic_id: clinicId,
        type,
        ...(status && { status }),
        ...(startDate || endDate
          ? {
              paid_date: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      _sum: { amount: true },
    });
  }

  // ─── financial_categories ───

  async listCategories(filters: CategoryFilters) {
    const where: Prisma.financial_categoriesWhereInput = {
      clinic_id: filters.clinicId,
      ...(filters.type && { type: filters.type }),
      ...(filters.isActive !== undefined && { is_active: filters.isActive }),
      ...(filters.name && {
        name: { contains: filters.name, mode: "insensitive" },
      }),
    };

    return prisma.financial_categories.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async getCategory(id: string, clinicId: string) {
    return prisma.financial_categories.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createCategory(data: Prisma.financial_categoriesCreateInput) {
    return prisma.financial_categories.create({ data });
  }

  async updateCategory(
    id: string,
    data: Prisma.financial_categoriesUpdateInput,
  ) {
    return prisma.financial_categories.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return prisma.financial_categories.delete({ where: { id } });
  }

  // ─── cash_registers ───

  async listCashRegisters(filters: CashRegisterFilters) {
    const where: Prisma.cash_registersWhereInput = {
      clinic_id: filters.clinicId,
      ...(filters.status && { status: filters.status }),
      ...(filters.openedBy && { opened_by: filters.openedBy }),
      ...(filters.startDate || filters.endDate
        ? {
            opened_at: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    };

    return prisma.cash_registers.findMany({
      where,
      orderBy: { opened_at: "desc" },
    });
  }

  async getCashRegister(id: string, clinicId: string) {
    return prisma.cash_registers.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createCashRegister(data: Prisma.cash_registersCreateInput) {
    return prisma.cash_registers.create({ data });
  }

  async updateCashRegister(id: string, data: Prisma.cash_registersUpdateInput) {
    return prisma.cash_registers.update({ where: { id }, data });
  }

  async deleteCashRegister(id: string) {
    return prisma.cash_registers.delete({ where: { id } });
  }

  async countOpenCashRegisters(clinicId: string) {
    return prisma.cash_registers.count({
      where: { clinic_id: clinicId, status: "ABERTO" },
    });
  }

  // ─── caixa_movimentos ───

  async listMovimentos(filters: MovimentoFilters) {
    const where: Prisma.caixa_movimentosWhereInput = {
      clinic_id: filters.clinicId,
      ...(filters.status && { status: filters.status }),
      ...(filters.tipo && { tipo: filters.tipo }),
      ...(filters.startDate || filters.endDate
        ? {
            created_at: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    };

    return prisma.caixa_movimentos.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  async getMovimento(id: string, clinicId: string) {
    return prisma.caixa_movimentos.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createMovimento(data: Prisma.caixa_movimentosCreateInput) {
    return prisma.caixa_movimentos.create({ data });
  }

  async updateMovimento(id: string, data: Prisma.caixa_movimentosUpdateInput) {
    return prisma.caixa_movimentos.update({ where: { id }, data });
  }

  async deleteMovimento(id: string) {
    return prisma.caixa_movimentos.delete({ where: { id } });
  }

  // ─── caixa_incidentes ───

  async listIncidentes(filters: IncidenteFilters) {
    const where: Prisma.caixa_incidentesWhereInput = {
      clinic_id: filters.clinicId,
      ...(filters.tipoIncidente && { tipo_incidente: filters.tipoIncidente }),
      ...(filters.startDate || filters.endDate
        ? {
            data_incidente: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
      OR: [{ tipo_incidente: "ROUBO" }, { valor_perdido: { gt: 1000 } }],
    };

    return prisma.caixa_incidentes.findMany({
      where,
      orderBy: { data_incidente: "desc" },
    });
  }

  async getIncidente(id: string, clinicId: string) {
    return prisma.caixa_incidentes.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createIncidente(data: Prisma.caixa_incidentesCreateInput) {
    return prisma.caixa_incidentes.create({ data });
  }

  async updateIncidente(id: string, data: Prisma.caixa_incidentesUpdateInput) {
    return prisma.caixa_incidentes.update({ where: { id }, data });
  }

  async deleteIncidente(id: string) {
    return prisma.caixa_incidentes.delete({ where: { id } });
  }

  // ─── contas_receber ───

  async listContasReceber(clinicId: string) {
    return prisma.contas_receber.findMany({
      where: { clinic_id: clinicId },
      orderBy: { data_vencimento: "asc" },
    });
  }

  async getContaReceber(id: string, clinicId: string) {
    return prisma.contas_receber.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createContaReceber(data: Prisma.contas_receberCreateInput) {
    return prisma.contas_receber.create({ data });
  }

  async updateContaReceber(id: string, data: Prisma.contas_receberUpdateInput) {
    return prisma.contas_receber.update({ where: { id }, data });
  }

  async deleteContaReceber(id: string) {
    return prisma.contas_receber.delete({ where: { id } });
  }

  async aggregateContasReceber(clinicId: string) {
    return prisma.contas_receber.aggregate({
      where: {
        clinic_id: clinicId,
        status: { not: "PAGO" },
      },
      _sum: { valor: true },
      _count: { id: true },
    });
  }

  async findContaReceberById(id: string) {
    return prisma.contas_receber.findUnique({ where: { id } });
  }

  // ─── contas_pagar ───

  async listContasPagar(clinicId: string) {
    return prisma.contas_pagar.findMany({
      where: { clinic_id: clinicId },
      orderBy: { data_vencimento: "asc" },
    });
  }

  async getContaPagar(id: string, clinicId: string) {
    return prisma.contas_pagar.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createContaPagar(data: Prisma.contas_pagarCreateInput) {
    return prisma.contas_pagar.create({ data });
  }

  async updateContaPagar(id: string, data: Prisma.contas_pagarUpdateInput) {
    return prisma.contas_pagar.update({ where: { id }, data });
  }

  async deleteContaPagar(id: string) {
    return prisma.contas_pagar.delete({ where: { id } });
  }

  async aggregateContasPagar(clinicId: string) {
    return prisma.contas_pagar.aggregate({
      where: {
        clinic_id: clinicId,
        status: { not: "PAGO" },
      },
      _sum: { valor: true },
      _count: { id: true },
    });
  }

  // ─── notas_fiscais ───

  async listNotasFiscais(clinicId: string) {
    return prisma.notas_fiscais.findMany({
      where: { clinic_id: clinicId },
      orderBy: { data_emissao: "desc" },
    });
  }

  async getNotaFiscal(id: string, clinicId: string) {
    return prisma.notas_fiscais.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async createNotaFiscal(data: Prisma.notas_fiscaisCreateInput) {
    return prisma.notas_fiscais.create({ data });
  }

  async updateNotaFiscal(id: string, data: Prisma.notas_fiscaisUpdateInput) {
    return prisma.notas_fiscais.update({ where: { id }, data });
  }

  async deleteNotaFiscal(id: string) {
    return prisma.notas_fiscais.delete({ where: { id } });
  }

  // ─── pdv_vendas ───

  async listVendasPDV(filters: VendaFilters) {
    const where: Prisma.pdv_vendasWhereInput = {
      clinic_id: filters.clinicId,
      ...(filters.startDate && {
        created_at: { gte: new Date(filters.startDate) },
      }),
    };

    return prisma.pdv_vendas.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  }

  // ─── banco_extratos ───

  async listExtratos(filters: ExtratoFilters) {
    const where: Prisma.banco_extratosWhereInput = {
      clinic_id: filters.clinicId,
      ...(filters.conciliado !== undefined && {
        conciliado: filters.conciliado,
      }),
    };

    return prisma.banco_extratos.findMany({
      where,
      orderBy: { date: "desc" },
    });
  }

  async getExtrato(id: string, clinicId: string) {
    return prisma.banco_extratos.findFirst({
      where: { id, clinic_id: clinicId },
    });
  }

  async updateExtrato(id: string, data: Prisma.banco_extratosUpdateInput) {
    return prisma.banco_extratos.update({ where: { id }, data });
  }

  // ─── patients (auxiliary) ───

  async getPatient(id: string) {
    return prisma.patients.findUnique({ where: { id } });
  }

  // ─── comunicacao_logs ───

  async createComunicacaoLog(data: Prisma.comunicacao_logsCreateInput) {
    return prisma.comunicacao_logs.create({ data });
  }

  // ─── transacoes_pagamento ───

  async createTransacaoPagamento(data: Prisma.orcamento_pagamentoCreateInput) {
    return prisma.orcamento_pagamento.create({ data });
  }

  // ─── Transaction support ───

  async processarPagamento(
    contaReceberId: string,
    updateData: Prisma.contas_receberUpdateInput,
    transacaoData: Record<string, unknown>,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.contas_receber.update({
        where: { id: contaReceberId },
        data: updateData,
      });
      const bill = await tx.contas_receber.findUnique({
        where: { id: contaReceberId },
      });
      if (bill) {
        await tx.orcamento_pagamento.create({ data: transacaoData as any });
      }
      return bill;
    });
  }
}
