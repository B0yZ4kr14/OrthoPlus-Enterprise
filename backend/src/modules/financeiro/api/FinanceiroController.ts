import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { FinanceiroService } from "@/modules/financeiro/application/FinanceiroService";
import {
  createTransactionSchema, updateTransactionSchema,
  createCategorySchema, updateCategorySchema,
  createCashRegisterSchema, updateCashRegisterSchema,
  createMovimentoSchema, updateMovimentoSchema,
  createIncidenteSchema, updateIncidenteSchema,
  createContaReceberSchema, updateContaReceberSchema,
  createContaPagarSchema, updateContaPagarSchema,
  createNotaFiscalSchema, updateNotaFiscalSchema,
  updateExtratoSchema,
} from "./schemas";

type Handler = (req: Request, res: Response) => Promise<void>;

function ok(res: Response, data: unknown, status = 200) { res.status(status).json(data); }
function noContent(res: Response) { res.status(204).send(); }
function err(res: Response, status: number, message: string) { res.status(status).json({ error: message }); }
function handleError(res: Response, error: unknown, context: string) {
  logger.error(`Error ${context}`, { error });
  res.status(500).json({ error: "Internal server error" });
}

function withAuth(handler: (req: Request, res: Response, clinicId: string) => Promise<void>): Handler {
  return async (req, res) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) { err(res, 401, "Clinic ID not found"); return; }
    try { await handler(req, res, clinicId); } catch (e) { handleError(res, e, "handler"); }
  };
}

function withAuthUser(handler: (req: Request, res: Response, clinicId: string, userId: string) => Promise<void>): Handler {
  return async (req, res) => {
    const clinicId = req.user?.clinicId, userId = req.user?.id;
    if (!clinicId || !userId) { err(res, 401, "Auth required"); return; }
    try { await handler(req, res, clinicId, userId); } catch (e) { handleError(res, e, "handler"); }
  };
}

function parse<T>(schema: any, body: unknown, res: Response): T | null {
  const r = schema.safeParse(body);
  if (!r.success) { err(res, 400, "Invalid input"); return null; }
  return r.data;
}

export class FinanceiroController {
  private svc = new FinanceiroService();

  // Transactions
  listTransactions = withAuth(async (_req, res, cid) => ok(res, await this.svc.listTransactions(cid, _req.query)));
  getTransaction = withAuth(async (req, res, cid) => { const d = await this.svc.getTransaction(req.params.id, cid); d ? ok(res, d) : err(res, 404, "Not found"); });
  createTransaction = withAuthUser(async (req, res, cid, uid) => { const d = parse(createTransactionSchema, req.body, res); if (!d) return; ok(res, await this.svc.createTransaction(cid, uid, d), 201); });
  updateTransaction = withAuth(async (req, res, cid) => { const d = parse(updateTransactionSchema, req.body, res); if (!d) return; const ex = await this.svc.getTransaction(req.params.id, cid); if (!ex) { err(res, 404, "Not found"); return; } ok(res, await this.svc.updateTransaction(req.params.id, d)); });
  deleteTransaction = withAuth(async (req, res, cid) => { const ex = await this.svc.getTransaction(req.params.id, cid); if (!ex) { err(res, 404, "Not found"); return; } await this.svc.deleteTransaction(req.params.id); noContent(res); });
  markTransactionAsPaid = withAuth(async (req, res, cid) => { const ex = await this.svc.getTransaction(req.params.id, cid); if (!ex) { err(res, 404, "Not found"); return; } ok(res, await this.svc.markTransactionAsPaid(req.params.id)); });

  // Categories
  listCategories = withAuth(async (_req, res, cid) => ok(res, await this.svc.listCategories(cid)));
  getCategory = withAuth(async (req, res, cid) => { const d = await this.svc.getCategory(req.params.id, cid); d ? ok(res, d) : err(res, 404, "Not found"); });
  createCategory = withAuth(async (req, res, cid) => { const d = parse(createCategorySchema, req.body, res); if (!d) return; ok(res, await this.svc.createCategory(cid, d), 201); });
  updateCategory = withAuth(async (req, res, _cid) => { const d = parse(updateCategorySchema, req.body, res); if (!d) return; ok(res, await this.svc.updateCategory(req.params.id, d)); });
  deleteCategory = withAuth(async (req, res, cid) => { const ex = await this.svc.getCategory(req.params.id, cid); if (!ex) { err(res, 404, "Not found"); return; } await this.svc.deleteCategory(req.params.id); noContent(res); });

  // Cash Registers
  listCashRegisters = withAuth(async (_req, res, cid) => ok(res, await this.svc.listCashRegisters(cid)));
  getCashRegister = withAuth(async (req, res, cid) => { const d = await this.svc.getCashRegister(req.params.id, cid); d ? ok(res, d) : err(res, 404, "Not found"); });
  createCashRegister = withAuthUser(async (req, res, cid, uid) => { const d = parse(createCashRegisterSchema, req.body, res); if (!d) return; ok(res, await this.svc.createCashRegister(cid, uid, d), 201); });
  updateCashRegister = withAuth(async (req, res, _cid) => { const d = parse(updateCashRegisterSchema, req.body, res); if (!d) return; ok(res, await this.svc.updateCashRegister(req.params.id, d)); });
  deleteCashRegister = withAuth(async (req, res, _cid) => { await this.svc.deleteCashRegister(req.params.id); noContent(res); });

  // Movimentos
  listMovimentos = withAuth(async (_req, res, cid) => ok(res, await this.svc.listMovimentos(cid)));
  getMovimento = withAuth(async (req, res, cid) => { const d = await this.svc.getMovimento(req.params.id, cid); d ? ok(res, d) : err(res, 404, "Not found"); });
  createMovimento = withAuth(async (req, res, cid) => { const d = parse(createMovimentoSchema, req.body, res); if (!d) return; ok(res, await this.svc.createMovimento(cid, d), 201); });
  updateMovimento = withAuth(async (req, res, _cid) => { const d = parse(updateMovimentoSchema, req.body, res); if (!d) return; ok(res, await this.svc.updateMovimento(req.params.id, d)); });
  deleteMovimento = withAuth(async (req, res, _cid) => { await this.svc.deleteMovimento(req.params.id); noContent(res); });

  // Incidentes
  listIncidentes = withAuth(async (_req, res, cid) => ok(res, await this.svc.listIncidentes(cid)));
  getIncidente = withAuth(async (req, res, cid) => { const d = await this.svc.getIncidente(req.params.id, cid); d ? ok(res, d) : err(res, 404, "Not found"); });
  createIncidente = withAuth(async (req, res, cid) => { const d = parse(createIncidenteSchema, req.body, res); if (!d) return; ok(res, await this.svc.createIncidente(cid, d), 201); });
  updateIncidente = withAuth(async (req, res, _cid) => { const d = parse(updateIncidenteSchema, req.body, res); if (!d) return; ok(res, await this.svc.updateIncidente(req.params.id, d)); });
  deleteIncidente = withAuth(async (req, res, _cid) => { await this.svc.deleteIncidente(req.params.id); noContent(res); });

  // Contas Receber
  listContasReceber = withAuth(async (_req, res, cid) => ok(res, await this.svc.listContasReceber(cid)));
  createContaReceber = withAuth(async (req, res, cid) => { const d = parse(createContaReceberSchema, req.body, res); if (!d) return; ok(res, await this.svc.createContaReceber(cid, d), 201); });
  updateContaReceber = withAuth(async (req, res, _cid) => { const d = parse(updateContaReceberSchema, req.body, res); if (!d) return; ok(res, await this.svc.updateContaReceber(req.params.id, d)); });
  deleteContaReceber = withAuth(async (req, res, _cid) => { await this.svc.deleteContaReceber(req.params.id); noContent(res); });

  // Contas Pagar
  listContasPagar = withAuth(async (_req, res, cid) => ok(res, await this.svc.listContasPagar(cid)));
  createContaPagar = withAuth(async (req, res, cid) => { const d = parse(createContaPagarSchema, req.body, res); if (!d) return; ok(res, await this.svc.createContaPagar(cid, d), 201); });
  updateContaPagar = withAuth(async (req, res, _cid) => { const d = parse(updateContaPagarSchema, req.body, res); if (!d) return; ok(res, await this.svc.updateContaPagar(req.params.id, d)); });
  deleteContaPagar = withAuth(async (req, res, _cid) => { await this.svc.deleteContaPagar(req.params.id); noContent(res); });

  // Notas Fiscais
  listNotasFiscais = withAuth(async (_req, res, cid) => ok(res, await this.svc.listNotasFiscais(cid)));
  createNotaFiscal = withAuth(async (req, res, cid) => { const d = parse(createNotaFiscalSchema, req.body, res); if (!d) return; ok(res, await this.svc.createNotaFiscal(cid, d), 201); });
  updateNotaFiscal = withAuth(async (req, res, _cid) => { const d = parse(updateNotaFiscalSchema, req.body, res); if (!d) return; ok(res, await this.svc.updateNotaFiscal(req.params.id, d)); });
  deleteNotaFiscal = withAuth(async (req, res, _cid) => { await this.svc.deleteNotaFiscal(req.params.id); noContent(res); });

  // Vendas PDV
  listVendasPDV = withAuth(async (req, res, cid) => ok(res, await this.svc.listVendasPDV(cid, req.query.start_date as string)));

  // Extratos
  listExtratos = withAuth(async (req, res, cid) => ok(res, await this.svc.listExtratos(cid, req.query.conciliado !== undefined ? req.query.conciliado === "true" : undefined)));
  updateExtrato = withAuth(async (req, res, cid) => { const d = parse(updateExtratoSchema, req.body, res); if (!d) return; const ex = await this.svc.getExtrato(req.params.id, cid); if (!ex) { err(res, 404, "Not found"); return; } ok(res, await this.svc.updateExtrato(req.params.id, d)); });

  // Resumo & Cash Flow
  getResumo = withAuth(async (_req, res, cid) => ok(res, await this.svc.getResumo(cid)));
  getCashFlow = withAuth(async (req, res, cid) => ok(res, await this.svc.getCashFlow(cid, req.query.start_date as string, req.query.end_date as string)));

  // Processar Pagamento
  processarPagamento = withAuthUser(async (req, res, cid, uid) => ok(res, await this.svc.processarPagamento(cid, uid, req.body)));

  // Legacy / Mocks
  sincronizarExtratoBancario = async (req: Request, res: Response) => { try { ok(res, await this.svc.sincronizarExtratoBancario(req.body.bancoConfigId)); } catch (e) { handleError(res, e, "syncing extratos"); } };
  sugerirSangriaIa = async (req: Request, res: Response) => { try { ok(res, await this.svc.sugerirSangriaIa(req.body.valorAtualCaixa)); } catch (e) { handleError(res, e, "suggesting sangria IA"); } };
  manageFinanceiroJobs = async (_req: Request, res: Response) => { try { ok(res, await this.svc.manageFinanceiroJobs()); } catch (e) { handleError(res, e, "managing financeiro jobs"); } };
  enviarCobranca = async (req: Request, res: Response) => { try { const { contaReceberId, method, message } = req.body; if (!contaReceberId || !method) { err(res, 400, "contaReceberId and method are required"); return; } ok(res, await this.svc.enviarCobranca(contaReceberId, method, message)); } catch (e) { handleError(res, e, "sending cobranca"); } };
  processarPagamentoTef = async (_req: Request, res: Response) => { try { ok(res, await this.svc.processarPagamentoTef()); } catch (e) { handleError(res, e, "processing TEF payment"); } };
  processarSplitPagamento = async (req: Request, res: Response) => { try { ok(res, await this.svc.processarSplitPagamento(req.body.transactionId, req.body.splits)); } catch (e) { handleError(res, e, "processing split payment"); } };
}
