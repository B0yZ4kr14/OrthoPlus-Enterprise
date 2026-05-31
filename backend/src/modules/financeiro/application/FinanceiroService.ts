import { z } from "zod";
import { IFinanceiroRepository } from "@/modules/financeiro/domain/repositories/IFinanceiroRepository";
import { ProcessarPagamentoUseCase } from "@/modules/financeiro/application/ProcessarPagamentoUseCase";
import { GetResumoFinanceiroUseCase } from "@/modules/financeiro/application/GetResumoFinanceiroUseCase";
import { GetCashFlowUseCase } from "@/modules/financeiro/application/GetCashFlowUseCase";
import { CreateTransactionUseCase } from "@/modules/financeiro/application/CreateTransactionUseCase";
import { FinanceiroRepository } from "@/modules/financeiro/infrastructure/FinanceiroRepository";
import {
  updateTransactionSchema,
  createCategorySchema,
  updateCategorySchema,
  createCashRegisterSchema,
  updateCashRegisterSchema,
  createMovimentoSchema,
  updateMovimentoSchema,
  createIncidenteSchema,
  updateIncidenteSchema,
  createContaReceberSchema,
  updateContaReceberSchema,
  createContaPagarSchema,
  updateContaPagarSchema,
  createNotaFiscalSchema,
  updateNotaFiscalSchema,
  updateExtratoSchema,
} from "@/modules/financeiro/api/schemas";

function badRequest(message: string, details?: unknown): Error {
  const err = new Error(message) as any;
  err.statusCode = 400;
  if (details) err.details = details;
  return err;
}

function notFound(message = "Not found"): Error {
  const err = new Error(message) as any;
  err.statusCode = 404;
  return err;
}

export class FinanceiroService {
  private repo: IFinanceiroRepository;
  private processarPagamentoUseCase: ProcessarPagamentoUseCase;
  private getResumoUseCase: GetResumoFinanceiroUseCase;
  private getCashFlowUseCase: GetCashFlowUseCase;
  private createTransactionUseCase: CreateTransactionUseCase;

  constructor(repo?: IFinanceiroRepository) {
    this.repo = repo ?? new FinanceiroRepository();
    this.processarPagamentoUseCase = new ProcessarPagamentoUseCase(this.repo);
    this.getResumoUseCase = new GetResumoFinanceiroUseCase(this.repo);
    this.getCashFlowUseCase = new GetCashFlowUseCase(this.repo);
    this.createTransactionUseCase = new CreateTransactionUseCase(this.repo);
  }

  private validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const parsed = schema.safeParse(data);
    if (!parsed.success)
      throw badRequest("Invalid input", parsed.error.flatten());
    return parsed.data;
  }

  // Transactions
  async listTransactions(clinicId: string, query: Record<string, unknown>) {
    const { type, status, category, payment_method, start_date, end_date } =
      query;
    return this.repo.listTransactions({
      clinicId,
      type: type as string | undefined,
      status: status as string | undefined,
      category: category as string | undefined,
      paymentMethod: payment_method as string | undefined,
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
    });
  }

  async getTransaction(id: string, clinicId: string) {
    const data = await this.repo.getTransaction(id, clinicId);
    if (!data) throw notFound();
    return data;
  }

  async createTransaction(clinicId: string, userId: string, body: unknown) {
    return this.createTransactionUseCase.execute(clinicId, userId, body);
  }

  async updateTransaction(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getTransaction(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateTransactionSchema, body);
    return this.repo.updateTransaction(id, data as any);
  }

  async deleteTransaction(id: string, clinicId: string) {
    const existing = await this.repo.getTransaction(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteTransaction(id);
  }

  async markTransactionAsPaid(id: string, clinicId: string) {
    const existing = await this.repo.getTransaction(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.updateTransaction(id, {
      status: "PAGO",
      paid_date: new Date().toISOString(),
    } as any);
  }

  // Categories
  async listCategories(clinicId: string, query: Record<string, unknown>) {
    const { type, is_active, name } = query;
    return this.repo.listCategories({
      clinicId,
      type: type as string | undefined,
      isActive: is_active !== undefined ? is_active === "true" : undefined,
      name: name as string | undefined,
    });
  }

  async getCategory(id: string, clinicId: string) {
    const data = await this.repo.getCategory(id, clinicId);
    if (!data) throw notFound();
    return data;
  }

  async createCategory(clinicId: string, body: unknown) {
    const data = this.validate(createCategorySchema, body);
    return this.repo.createCategory({ ...data, clinic_id: clinicId } as any);
  }

  async updateCategory(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getCategory(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateCategorySchema, body);
    return this.repo.updateCategory(id, data as any);
  }

  async deleteCategory(id: string, clinicId: string) {
    const existing = await this.repo.getCategory(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteCategory(id);
  }

  // Cash Registers
  async listCashRegisters(clinicId: string, query: Record<string, unknown>) {
    const { status, opened_by, start_date, end_date } = query;
    return this.repo.listCashRegisters({
      clinicId,
      status: status as string | undefined,
      openedBy: opened_by as string | undefined,
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
    });
  }

  async getCashRegister(id: string, clinicId: string) {
    const data = await this.repo.getCashRegister(id, clinicId);
    if (!data) throw notFound();
    return data;
  }

  async createCashRegister(clinicId: string, body: unknown) {
    const data = this.validate(createCashRegisterSchema, body);
    return this.repo.createCashRegister({
      ...data,
      clinic_id: clinicId,
    } as any);
  }

  async updateCashRegister(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getCashRegister(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateCashRegisterSchema, body);
    return this.repo.updateCashRegister(id, data as any);
  }

  async deleteCashRegister(id: string, clinicId: string) {
    const existing = await this.repo.getCashRegister(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteCashRegister(id);
  }

  // Movimentos
  async listMovimentos(clinicId: string, query: Record<string, unknown>) {
    const { status, tipo, start_date, end_date } = query;
    return this.repo.listMovimentos({
      clinicId,
      status: status as string | undefined,
      tipo: tipo as string | undefined,
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
    });
  }

  async getMovimento(id: string, clinicId: string) {
    const data = await this.repo.getMovimento(id, clinicId);
    if (!data) throw notFound();
    return data;
  }

  async createMovimento(clinicId: string, body: unknown) {
    const data = this.validate(createMovimentoSchema, body);
    return this.repo.createMovimento({ ...data, clinic_id: clinicId } as any);
  }

  async updateMovimento(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getMovimento(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateMovimentoSchema, body);
    return this.repo.updateMovimento(id, data as any);
  }

  async deleteMovimento(id: string, clinicId: string) {
    const existing = await this.repo.getMovimento(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteMovimento(id);
  }

  // Incidentes
  async listIncidentes(clinicId: string, query: Record<string, unknown>) {
    const { tipo_incidente, start_date, end_date } = query;
    return this.repo.listIncidentes({
      clinicId,
      tipoIncidente: tipo_incidente as string | undefined,
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
    });
  }

  async getIncidente(id: string, clinicId: string) {
    const data = await this.repo.getIncidente(id, clinicId);
    if (!data) throw notFound();
    return data;
  }

  async createIncidente(clinicId: string, body: unknown) {
    const data = this.validate(createIncidenteSchema, body);
    return this.repo.createIncidente({ ...data, clinic_id: clinicId } as any);
  }

  async updateIncidente(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getIncidente(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateIncidenteSchema, body);
    return this.repo.updateIncidente(id, data as any);
  }

  async deleteIncidente(id: string, clinicId: string) {
    const existing = await this.repo.getIncidente(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteIncidente(id);
  }

  // Contas Receber
  async listContasReceber(clinicId: string) {
    return this.repo.listContasReceber(clinicId);
  }

  async createContaReceber(clinicId: string, userId: string, body: unknown) {
    const data = this.validate(createContaReceberSchema, body);
    return this.repo.createContaReceber({
      ...data,
      clinic_id: clinicId,
      created_by: userId,
    } as any);
  }

  async updateContaReceber(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getContaReceber(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateContaReceberSchema, body);
    return this.repo.updateContaReceber(id, data as any);
  }

  async deleteContaReceber(id: string, clinicId: string) {
    const existing = await this.repo.getContaReceber(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteContaReceber(id);
  }

  // Contas Pagar
  async listContasPagar(clinicId: string) {
    return this.repo.listContasPagar(clinicId);
  }

  async createContaPagar(clinicId: string, userId: string, body: unknown) {
    const data = this.validate(createContaPagarSchema, body);
    return this.repo.createContaPagar({
      ...data,
      clinic_id: clinicId,
      created_by: userId,
    } as any);
  }

  async updateContaPagar(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getContaPagar(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateContaPagarSchema, body);
    return this.repo.updateContaPagar(id, data as any);
  }

  async deleteContaPagar(id: string, clinicId: string) {
    const existing = await this.repo.getContaPagar(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteContaPagar(id);
  }

  // Notas Fiscais
  async listNotasFiscais(clinicId: string) {
    return this.repo.listNotasFiscais(clinicId);
  }

  async createNotaFiscal(clinicId: string, userId: string, body: unknown) {
    const data = this.validate(createNotaFiscalSchema, body);
    return this.repo.createNotaFiscal({
      ...data,
      clinic_id: clinicId,
      created_by: userId,
    } as any);
  }

  async updateNotaFiscal(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getNotaFiscal(id, clinicId);
    if (!existing) throw notFound();
    const data = this.validate(updateNotaFiscalSchema, body);
    return this.repo.updateNotaFiscal(id, data as any);
  }

  async deleteNotaFiscal(id: string, clinicId: string) {
    const existing = await this.repo.getNotaFiscal(id, clinicId);
    if (!existing) throw notFound();
    return this.repo.deleteNotaFiscal(id);
  }

  // PDV Vendas
  async listVendasPDV(clinicId: string, startDate?: string) {
    const vendas = await this.repo.listVendasPDV({ clinicId, startDate });
    return vendas.map((v) => ({
      ...v,
      pdv_venda_itens: (v.metadata as any)?.itens || [],
      pdv_pagamentos: (v.metadata as any)?.pagamentos || [],
    }));
  }

  // Extratos
  async listExtratos(clinicId: string, conciliado?: boolean) {
    return this.repo.listExtratos({ clinicId, conciliado });
  }

  async updateExtrato(id: string, clinicId: string, body: unknown) {
    const existing = await this.repo.getExtrato(id, clinicId);
    if (!existing) throw notFound();
    const { conciliado, transaction_id, observacoes } = this.validate(
      updateExtratoSchema,
      body,
    );
    return this.repo.updateExtrato(id, {
      ...(conciliado !== undefined && { conciliado }),
      ...(transaction_id !== undefined && { transaction_id }),
      ...(observacoes !== undefined && { observacoes }),
    } as any);
  }

  // Resumo & Cash Flow
  async getResumo(clinicId: string) {
    return this.getResumoUseCase.execute(clinicId);
  }

  async getCashFlow(clinicId: string, startDate?: string, endDate?: string) {
    return this.getCashFlowUseCase.execute(clinicId, startDate, endDate);
  }

  // Legacy
  async sincronizarExtratoBancario(body: Record<string, unknown>) {
    const { bancoConfigId } = body;
    return {
      success: true,
      message: "Sync complete",
      config: bancoConfigId,
      sincronizados: 0,
    };
  }

  async sugerirSangriaIa(body: Record<string, unknown>) {
    const { valorAtualCaixa } = body;
    return {
      success: true,
      sugestao: {
        valorSangria: 0,
        reservar: valorAtualCaixa,
        motivo: "Model rules currently mocked",
      },
    };
  }

  async manageFinanceiroJobs() {
    return { success: true, executed: true };
  }

  async enviarCobranca(clinicId: string, body: Record<string, unknown>) {
    const contaReceberId = body.contaReceberId as string;
    const method = body.method as string;
    const message = body.message as string | undefined;
    if (!contaReceberId || !method)
      throw badRequest("contaReceberId and method are required");
    const cobranca = await this.repo.findContaReceberById(contaReceberId);
    if (!cobranca || cobranca.clinic_id !== clinicId)
      throw notFound("Billing record not found");
    const patient = cobranca.patient_id
      ? await this.repo.getPatient(cobranca.patient_id)
      : null;
    await this.repo.createComunicacaoLog({
      paciente_id: cobranca.patient_id,
      clinic_id: clinicId,
      tipo: method.toUpperCase(),
      mensagem:
        message ||
        `Cobrança de R$ ${cobranca.valor} enviada.` +
          (patient ? ` para ${patient.full_name}` : ""),
      status: "ENVIADO",
    } as any);
    return { success: true, message: "Cobrança enviada com sucesso" };
  }

  async processarPagamento(clinicId: string, body: Record<string, unknown>) {
    const contaReceberId = body.contaReceberId as string;
    const amount = body.amount as number;
    const paymentMethod = body.paymentMethod as string;
    if (!contaReceberId || !amount || !paymentMethod)
      throw badRequest("Required fields missing");
    const contaReceber = await this.repo.findContaReceberById(contaReceberId);
    if (!contaReceber || contaReceber.clinic_id !== clinicId)
      throw notFound("Billing record not found");
    const result = await this.processarPagamentoUseCase.execute({
      contaReceberId,
      amount,
      paymentMethod,
    });
    return {
      success: true,
      transaction_id: result.transactionId,
      status: result.status,
    };
  }

  async processarPagamentoTef() {
    return {
      success: true,
      message: "TEF operation initiated",
      status: "WAITING_PINPAD_INTERACTION",
    };
  }

  async processarSplitPagamento(clinicId: string, body: Record<string, unknown>) {
    const transactionId = body.transactionId as string;
    const splits = body.splits as unknown[];
    if (!transactionId || !splits || !splits.length)
      throw badRequest("transactionId and splits mapping are required");
    const transaction = await this.repo.getTransaction(transactionId, clinicId);
    if (!transaction) throw notFound("Transaction not found");
    return { success: true, message: "Split rules applied successfully" };
  }
}
