import { FinanceiroRepository } from "@/modules/financeiro/infrastructure/FinanceiroRepository";
import { ProcessarPagamentoUseCase } from "@/modules/financeiro/application/ProcessarPagamentoUseCase";
import { GetResumoFinanceiroUseCase } from "@/modules/financeiro/application/GetResumoFinanceiroUseCase";
import { GetCashFlowUseCase } from "@/modules/financeiro/application/GetCashFlowUseCase";

export class FinanceiroService {
  private repo = new FinanceiroRepository();
  private processarPagamentoUseCase = new ProcessarPagamentoUseCase();
  private getResumoUseCase = new GetResumoFinanceiroUseCase();
  private getCashFlowUseCase = new GetCashFlowUseCase();

  // ── Transactions ──

  async listTransactions(clinicId: string, filters: any) {
    return this.repo.listTransactions({
      clinicId,
      type: filters.type as string | undefined,
      status: filters.status as string | undefined,
      category: filters.category as string | undefined,
      paymentMethod: filters.payment_method as string | undefined,
      startDate: filters.start_date as string | undefined,
      endDate: filters.end_date as string | undefined,
    });
  }

  async getTransaction(id: string, clinicId: string) {
    return this.repo.getTransaction(id, clinicId);
  }

  async createTransaction(clinicId: string, userId: string, data: any) {
    return this.repo.createTransaction({ ...data, clinic_id: clinicId, created_by: userId } as any);
  }

  async updateTransaction(id: string, data: any) {
    return this.repo.updateTransaction(id, data as any);
  }

  async deleteTransaction(id: string) {
    return this.repo.deleteTransaction(id);
  }

  async markTransactionAsPaid(id: string) {
    return this.repo.updateTransaction(id, { status: "PAGO", paid_date: new Date().toISOString() } as any);
  }

  // ── Categories ──

  async listCategories(clinicId: string) {
    return this.repo.listCategories({ clinicId });
  }

  async getCategory(id: string, clinicId: string) {
    return this.repo.getCategory(id, clinicId);
  }

  async createCategory(clinicId: string, data: any) {
    return this.repo.createCategory({ ...data, clinic_id: clinicId } as any);
  }

  async updateCategory(id: string, data: any) {
    return this.repo.updateCategory(id, data as any);
  }

  async deleteCategory(id: string) {
    return this.repo.deleteCategory(id);
  }

  // ── Cash Registers ──

  async listCashRegisters(clinicId: string) {
    return this.repo.listCashRegisters({ clinicId });
  }

  async getCashRegister(id: string, clinicId: string) {
    return this.repo.getCashRegister(id, clinicId);
  }

  async createCashRegister(clinicId: string, userId: string, data: any) {
    return this.repo.createCashRegister({ ...data, clinic_id: clinicId, opened_by: userId } as any);
  }

  async updateCashRegister(id: string, data: any) {
    return this.repo.updateCashRegister(id, data as any);
  }

  async deleteCashRegister(id: string) {
    return this.repo.deleteCashRegister(id);
  }

  // ── Movimentos ──

  async listMovimentos(clinicId: string) {
    return this.repo.listMovimentos({ clinicId });
  }

  async getMovimento(id: string, clinicId: string) {
    return this.repo.getMovimento(id, clinicId);
  }

  async createMovimento(clinicId: string, data: any) {
    return this.repo.createMovimento({ ...data, clinic_id: clinicId } as any);
  }

  async updateMovimento(id: string, data: any) {
    return this.repo.updateMovimento(id, data as any);
  }

  async deleteMovimento(id: string) {
    return this.repo.deleteMovimento(id);
  }

  // ── Incidentes ──

  async listIncidentes(clinicId: string) {
    return this.repo.listIncidentes({ clinicId });
  }

  async getIncidente(id: string, clinicId: string) {
    return this.repo.getIncidente(id, clinicId);
  }

  async createIncidente(clinicId: string, data: any) {
    return this.repo.createIncidente({ ...data, clinic_id: clinicId } as any);
  }

  async updateIncidente(id: string, data: any) {
    return this.repo.updateIncidente(id, data as any);
  }

  async deleteIncidente(id: string) {
    return this.repo.deleteIncidente(id);
  }

  // ── Contas Receber ──

  async listContasReceber(clinicId: string) {
    return this.repo.listContasReceber(clinicId);
  }

  async getContaReceber(id: string, clinicId: string) {
    return this.repo.getContaReceber(id, clinicId);
  }

  async createContaReceber(clinicId: string, data: any) {
    return this.repo.createContaReceber({ ...data, clinic_id: clinicId } as any);
  }

  async updateContaReceber(id: string, data: any) {
    return this.repo.updateContaReceber(id, data as any);
  }

  async deleteContaReceber(id: string) {
    return this.repo.deleteContaReceber(id);
  }

  // ── Contas Pagar ──

  async listContasPagar(clinicId: string) {
    return this.repo.listContasPagar(clinicId);
  }

  async getContaPagar(id: string, clinicId: string) {
    return this.repo.getContaPagar(id, clinicId);
  }

  async createContaPagar(clinicId: string, data: any) {
    return this.repo.createContaPagar({ ...data, clinic_id: clinicId } as any);
  }

  async updateContaPagar(id: string, data: any) {
    return this.repo.updateContaPagar(id, data as any);
  }

  async deleteContaPagar(id: string) {
    return this.repo.deleteContaPagar(id);
  }

  // ── Notas Fiscais ──

  async listNotasFiscais(clinicId: string) {
    return this.repo.listNotasFiscais(clinicId);
  }

  async getNotaFiscal(id: string, clinicId: string) {
    return this.repo.getNotaFiscal(id, clinicId);
  }

  async createNotaFiscal(clinicId: string, data: any) {
    return this.repo.createNotaFiscal({ ...data, clinic_id: clinicId } as any);
  }

  async updateNotaFiscal(id: string, data: any) {
    return this.repo.updateNotaFiscal(id, data as any);
  }

  async deleteNotaFiscal(id: string) {
    return this.repo.deleteNotaFiscal(id);
  }

  // ── Vendas PDV ──

  async listVendasPDV(clinicId: string, startDate?: string) {
    const vendas = await this.repo.listVendasPDV({ clinicId, startDate });
    return vendas.map((v) => ({
      ...v,
      pdv_venda_itens: ((v.metadata as any)?.itens) || [],
      pdv_vagamentos: ((v.metadata as any)?.pagamentos) || [],
    }));
  }

  // ── Extratos ──

  async listExtratos(clinicId: string, conciliado?: boolean) {
    return this.repo.listExtratos({ clinicId, conciliado });
  }

  async getExtrato(id: string, clinicId: string) {
    return this.repo.getExtrato(id, clinicId);
  }

  async updateExtrato(id: string, data: any) {
    return this.repo.updateExtrato(id, data as any);
  }

  // ── Resumo & Cash Flow ──

  async getResumo(clinicId: string) {
    return this.getResumoUseCase.execute(clinicId);
  }

  async getCashFlow(clinicId: string, startDate?: string, endDate?: string) {
    return this.getCashFlowUseCase.execute(clinicId, startDate, endDate);
  }

  // ── Processar Pagamento ──

  async processarPagamento(clinicId: string, userId: string, data: any) {
    return this.processarPagamentoUseCase.execute({ clinicId, userId, ...data } as any);
  }

  // ── Legacy / Mocks ──

  async sincronizarExtratoBancario(bancoConfigId: string) {
    return { success: true, message: "Sync complete", config: bancoConfigId, sincronizados: 0 };
  }

  async sugerirSangriaIa(valorAtualCaixa: number) {
    return {
      success: true,
      sugestao: { valorSangria: 0, reservar: valorAtualCaixa, motivo: "Model rules currently mocked" },
    };
  }

  async manageFinanceiroJobs() {
    return { success: true, executed: true };
  }

  async enviarCobranca(contaReceberId: string, method: string, message?: string) {
    const cobranca = await this.repo.findContaReceberById(contaReceberId);
    if (!cobranca) throw new Error("Billing record not found");

    const patient = cobranca.patient_id ? await this.repo.getPatient(cobranca.patient_id) : null;

    await this.repo.createComunicacaoLog({
      paciente_id: cobranca.patient_id,
      clinic_id: cobranca.clinic_id,
      tipo: method.toUpperCase(),
      mensagem: message || `Cobrança de R$ ${cobranca.valor} enviada.` + (patient ? ` para ${(patient as any).full_name}` : ""),
      status: "ENVIADO",
    } as any);

    return { success: true, message: "Cobrança enviada com sucesso" };
  }

  async processarPagamentoTef() {
    return { success: true, message: "TEF operation initiated", status: "WAITING_PINPAD_INTERACTION" };
  }

  async processarSplitPagamento(transactionId: string, splits: unknown[]) {
    if (!transactionId || !splits || !splits.length) {
      throw new Error("transactionId and splits mapping are required");
    }
    return { success: true, message: "Split rules applied successfully" };
  }
}
