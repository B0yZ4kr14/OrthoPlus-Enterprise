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
    clinicId: string,
    data: Prisma.financial_transactionsUpdateInput,
  ) {
    return prisma.financial_transactions.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteTransaction(id: string, clinicId: string) {
    return prisma.financial_transactions.delete({ where: { id, clinic_id: clinicId } });
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
    clinicId: string,
    data: Prisma.financial_categoriesUpdateInput,
  ) {
    return prisma.financial_categories.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteCategory(id: string, clinicId: string) {
    return prisma.financial_categories.delete({ where: { id, clinic_id: clinicId } });
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

  async updateCashRegister(id: string, clinicId: string, data: Prisma.cash_registersUpdateInput) {
    return prisma.cash_registers.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteCashRegister(id: string, clinicId: string) {
    return prisma.cash_registers.delete({ where: { id, clinic_id: clinicId } });
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

  async updateMovimento(id: string, clinicId: string, data: Prisma.caixa_movimentosUpdateInput) {
    return prisma.caixa_movimentos.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteMovimento(id: string, clinicId: string) {
    return prisma.caixa_movimentos.delete({ where: { id, clinic_id: clinicId } });
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

  async updateIncidente(id: string, clinicId: string, data: Prisma.caixa_incidentesUpdateInput) {
    return prisma.caixa_incidentes.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteIncidente(id: string, clinicId: string) {
    return prisma.caixa_incidentes.delete({ where: { id, clinic_id: clinicId } });
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

  async updateContaReceber(id: string, clinicId: string, data: Prisma.contas_receberUpdateInput) {
    return prisma.contas_receber.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteContaReceber(id: string, clinicId: string) {
    return prisma.contas_receber.delete({ where: { id, clinic_id: clinicId } });
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

  async findContaReceberById(id: string, clinicId: string) {
    return prisma.contas_receber.findFirst({ where: { id, clinic_id: clinicId } });
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

  async updateContaPagar(id: string, clinicId: string, data: Prisma.contas_pagarUpdateInput) {
    return prisma.contas_pagar.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteContaPagar(id: string, clinicId: string) {
    return prisma.contas_pagar.delete({ where: { id, clinic_id: clinicId } });
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

  async updateNotaFiscal(id: string, clinicId: string, data: Prisma.notas_fiscaisUpdateInput) {
    return prisma.notas_fiscais.update({ where: { id, clinic_id: clinicId }, data });
  }

  async deleteNotaFiscal(id: string, clinicId: string) {
    return prisma.notas_fiscais.delete({ where: { id, clinic_id: clinicId } });
  }

  // ─── fiscal_config ───

  async getFiscalConfig(clinicId: string) {
    return prisma.fiscal_config.findFirst({
      where: { clinic_id: clinicId },
    });
  }

  async createFiscalConfig(data: Prisma.fiscal_configCreateInput) {
    return prisma.fiscal_config.create({ data });
  }

  async updateFiscalConfig(
    id: string,
    clinicId: string,
    data: Prisma.fiscal_configUpdateInput,
  ) {
    return prisma.fiscal_config.update({ where: { id, clinic_id: clinicId }, data });
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

  async updateExtrato(id: string, clinicId: string, data: Prisma.banco_extratosUpdateInput) {
    return prisma.banco_extratos.update({ where: { id, clinic_id: clinicId }, data });
  }

  // ─── patients (auxiliary) ───

  async getPatient(id: string, clinicId: string) {
    return prisma.patients.findFirst({ where: { id, clinic_id: clinicId } });
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
    clinicId: string,
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
        await tx.orcamento_pagamento.create({
          data: {
            ...transacaoData,
            clinic_id: clinicId,
          } as any,
        });
      }
      return bill;
    });
  }
}
