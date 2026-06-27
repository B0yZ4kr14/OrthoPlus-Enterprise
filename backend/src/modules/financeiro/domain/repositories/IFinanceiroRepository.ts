import { Prisma } from "@prisma/client";
import type {
  financial_transactions,
  financial_categories,
  cash_registers,
  caixa_movimentos,
  caixa_incidentes,
  contas_receber,
  contas_pagar,
  notas_fiscais,
  fiscal_config,
  pdv_vendas,
  banco_extratos,
  patients,
  comunicacao_logs,
  orcamento_pagamento,
} from "@prisma/client";

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

/**
 * IFinanceiroRepository — interface for financeiro module database access.
 * Decouples use-cases from Prisma / infrastructure details.
 */
export interface IFinanceiroRepository {
  // financial_transactions
  listTransactions(
    filters: TransactionFilters,
  ): Promise<financial_transactions[]>;
  getTransaction(
    id: string,
    clinicId: string,
  ): Promise<financial_transactions | null>;
  createTransaction(
    data: Prisma.financial_transactionsCreateInput,
  ): Promise<financial_transactions>;
  updateTransaction(
    id: string,
    clinicId: string,
    data: Prisma.financial_transactionsUpdateInput,
  ): Promise<financial_transactions>;
  deleteTransaction(id: string, clinicId: string): Promise<financial_transactions>;
  aggregateTransactions(
    clinicId: string,
    type: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<
    Prisma.GetFinancial_transactionsAggregateType<Prisma.Financial_transactionsAggregateArgs>
  >;

  // financial_categories
  listCategories(filters: CategoryFilters): Promise<financial_categories[]>;
  getCategory(
    id: string,
    clinicId: string,
  ): Promise<financial_categories | null>;
  createCategory(
    data: Prisma.financial_categoriesCreateInput,
  ): Promise<financial_categories>;
  updateCategory(
    id: string,
    clinicId: string,
    data: Prisma.financial_categoriesUpdateInput,
  ): Promise<financial_categories>;
  deleteCategory(id: string, clinicId: string): Promise<financial_categories>;

  // cash_registers
  listCashRegisters(filters: CashRegisterFilters): Promise<cash_registers[]>;
  getCashRegister(id: string, clinicId: string): Promise<cash_registers | null>;
  createCashRegister(
    data: Prisma.cash_registersCreateInput,
  ): Promise<cash_registers>;
  updateCashRegister(
    id: string,
    clinicId: string,
    data: Prisma.cash_registersUpdateInput,
  ): Promise<cash_registers>;
  deleteCashRegister(id: string, clinicId: string): Promise<cash_registers>;
  countOpenCashRegisters(clinicId: string): Promise<number>;

  // caixa_movimentos
  listMovimentos(filters: MovimentoFilters): Promise<caixa_movimentos[]>;
  getMovimento(id: string, clinicId: string): Promise<caixa_movimentos | null>;
  createMovimento(
    data: Prisma.caixa_movimentosCreateInput,
  ): Promise<caixa_movimentos>;
  updateMovimento(
    id: string,
    clinicId: string,
    data: Prisma.caixa_movimentosUpdateInput,
  ): Promise<caixa_movimentos>;
  deleteMovimento(id: string, clinicId: string): Promise<caixa_movimentos>;

  // caixa_incidentes
  listIncidentes(filters: IncidenteFilters): Promise<caixa_incidentes[]>;
  getIncidente(id: string, clinicId: string): Promise<caixa_incidentes | null>;
  createIncidente(
    data: Prisma.caixa_incidentesCreateInput,
  ): Promise<caixa_incidentes>;
  updateIncidente(
    id: string,
    clinicId: string,
    data: Prisma.caixa_incidentesUpdateInput,
  ): Promise<caixa_incidentes>;
  deleteIncidente(id: string, clinicId: string): Promise<caixa_incidentes>;

  // contas_receber
  listContasReceber(clinicId: string): Promise<contas_receber[]>;
  getContaReceber(id: string, clinicId: string): Promise<contas_receber | null>;
  createContaReceber(
    data: Prisma.contas_receberCreateInput,
  ): Promise<contas_receber>;
  updateContaReceber(
    id: string,
    clinicId: string,
    data: Prisma.contas_receberUpdateInput,
  ): Promise<contas_receber>;
  deleteContaReceber(id: string, clinicId: string): Promise<contas_receber>;
  aggregateContasReceber(
    clinicId: string,
  ): Promise<
    Prisma.GetContas_receberAggregateType<Prisma.Contas_receberAggregateArgs>
  >;
  findContaReceberById(id: string, clinicId: string): Promise<contas_receber | null>;

  // contas_pagar
  listContasPagar(clinicId: string): Promise<contas_pagar[]>;
  getContaPagar(id: string, clinicId: string): Promise<contas_pagar | null>;
  createContaPagar(data: Prisma.contas_pagarCreateInput): Promise<contas_pagar>;
  updateContaPagar(
    id: string,
    clinicId: string,
    data: Prisma.contas_pagarUpdateInput,
  ): Promise<contas_pagar>;
  deleteContaPagar(id: string, clinicId: string): Promise<contas_pagar>;
  aggregateContasPagar(
    clinicId: string,
  ): Promise<
    Prisma.GetContas_pagarAggregateType<Prisma.Contas_pagarAggregateArgs>
  >;

  // notas_fiscais
  listNotasFiscais(clinicId: string): Promise<notas_fiscais[]>;
  getNotaFiscal(id: string, clinicId: string): Promise<notas_fiscais | null>;
  createNotaFiscal(
    data: Prisma.notas_fiscaisCreateInput,
  ): Promise<notas_fiscais>;
  updateNotaFiscal(
    id: string,
    clinicId: string,
    data: Prisma.notas_fiscaisUpdateInput,
  ): Promise<notas_fiscais>;
  deleteNotaFiscal(id: string, clinicId: string): Promise<notas_fiscais>;

  // fiscal_config
  getFiscalConfig(clinicId: string): Promise<fiscal_config | null>;
  createFiscalConfig(
    data: Prisma.fiscal_configCreateInput,
  ): Promise<fiscal_config>;
  updateFiscalConfig(
    id: string,
    clinicId: string,
    data: Prisma.fiscal_configUpdateInput,
  ): Promise<fiscal_config>;

  // pdv_vendas
  listVendasPDV(filters: VendaFilters): Promise<pdv_vendas[]>;

  // banco_extratos
  listExtratos(filters: ExtratoFilters): Promise<banco_extratos[]>;
  getExtrato(id: string, clinicId: string): Promise<banco_extratos | null>;
  updateExtrato(
    id: string,
    clinicId: string,
    data: Prisma.banco_extratosUpdateInput,
  ): Promise<banco_extratos>;

  // auxiliary
  getPatient(id: string, clinicId: string): Promise<patients | null>;
  createComunicacaoLog(
    data: Prisma.comunicacao_logsCreateInput,
  ): Promise<comunicacao_logs>;
  createTransacaoPagamento(
    data: Prisma.orcamento_pagamentoCreateInput,
  ): Promise<orcamento_pagamento>;

  // transaction support
  processarPagamento(
    contaReceberId: string,
    updateData: Prisma.contas_receberUpdateInput,
    transacaoData: Record<string, unknown>,
  ): Promise<contas_receber | null>;
}
