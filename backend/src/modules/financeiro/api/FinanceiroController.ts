import { Request, Response } from "express";
import { logger } from "@/infrastructure/logger";
import { FinanceiroService } from "@/modules/financeiro/application/FinanceiroService";

export class FinanceiroController {
  private service = new FinanceiroService();

  private wrap(
    fn: (req: Request, res: Response) => Promise<void>,
    context: string,
  ) {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        await fn(req, res);
      } catch (error: unknown) {
        const apiError = error as { statusCode?: number; message?: string; details?: unknown };
        if (apiError.statusCode) {
          res.status(apiError.statusCode).json({
            type: `https://httpstatuses.com/${apiError.statusCode}`,
            title: apiError.message,
            status: apiError.statusCode,
            detail: apiError.message,
            errors: apiError.details,
          });
          return;
        }
        logger.error(context, { error });
        res.status(500).json({
          type: "https://httpstatuses.com/500",
          title: "Internal server error",
          status: 500,
          detail: "Internal server error",
        });
      }
    };
  }

  private withClinic(
    context: string,
    fn: (clinicId: string, req: Request, res: Response) => Promise<void>,
    options?: { needsUserId?: boolean },
  ) {
    return this.wrap(async (req, res) => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({
          type: "https://httpstatuses.com/401",
          title: "Unauthorized",
          status: 401,
          detail: "Clinic ID not found",
        });
        return;
      }
      if (options?.needsUserId && !req.user?.id) {
        res.status(401).json({
          type: "https://httpstatuses.com/401",
          title: "Unauthorized",
          status: 401,
          detail: "Auth required",
        });
        return;
      }
      await fn(clinicId, req, res);
    }, context);
  }

  listTransactions = this.withClinic(
    "Error listing transactions",
    async (c, req, res) => {
      res.json(await this.service.listTransactions(c, req.query));
    },
  );
  getTransaction = this.withClinic(
    "Error getting transaction",
    async (c, req, res) => {
      res.json(await this.service.getTransaction(req.params.id, c));
    },
  );
  createTransaction = this.withClinic(
    "Error creating transaction",
    async (c, req, res) => {
      res
        .status(201)
        .json(await this.service.createTransaction(c, req.user!.id, req.body));
    },
    { needsUserId: true },
  );
  updateTransaction = this.withClinic(
    "Error updating transaction",
    async (c, req, res) => {
      res.json(
        await this.service.updateTransaction(req.params.id, c, req.body),
      );
    },
  );
  deleteTransaction = this.withClinic(
    "Error deleting transaction",
    async (c, req, res) => {
      await this.service.deleteTransaction(req.params.id, c);
      res.status(204).send();
    },
  );
  markTransactionAsPaid = this.withClinic(
    "Error marking transaction as paid",
    async (c, req, res) => {
      res.json(await this.service.markTransactionAsPaid(req.params.id, c));
    },
  );

  listCategories = this.withClinic(
    "Error listing categories",
    async (c, req, res) => {
      res.json(await this.service.listCategories(c, req.query));
    },
  );
  getCategory = this.withClinic(
    "Error getting category",
    async (c, req, res) => {
      res.json(await this.service.getCategory(req.params.id, c));
    },
  );
  createCategory = this.withClinic(
    "Error creating category",
    async (c, req, res) => {
      res.status(201).json(await this.service.createCategory(c, req.body));
    },
  );
  updateCategory = this.withClinic(
    "Error updating category",
    async (c, req, res) => {
      res.json(await this.service.updateCategory(req.params.id, c, req.body));
    },
  );
  deleteCategory = this.withClinic(
    "Error deleting category",
    async (c, req, res) => {
      await this.service.deleteCategory(req.params.id, c);
      res.status(204).send();
    },
  );

  listCashRegisters = this.withClinic(
    "Error listing cash registers",
    async (c, req, res) => {
      res.json(await this.service.listCashRegisters(c, req.query));
    },
  );
  getCashRegister = this.withClinic(
    "Error getting cash register",
    async (c, req, res) => {
      res.json(await this.service.getCashRegister(req.params.id, c));
    },
  );
  createCashRegister = this.withClinic(
    "Error creating cash register",
    async (c, req, res) => {
      res.status(201).json(await this.service.createCashRegister(c, req.body));
    },
  );
  updateCashRegister = this.withClinic(
    "Error updating cash register",
    async (c, req, res) => {
      res.json(
        await this.service.updateCashRegister(req.params.id, c, req.body),
      );
    },
  );
  deleteCashRegister = this.withClinic(
    "Error deleting cash register",
    async (c, req, res) => {
      await this.service.deleteCashRegister(req.params.id, c);
      res.status(204).send();
    },
  );

  listMovimentos = this.withClinic(
    "Error listing movimentos",
    async (c, req, res) => {
      res.json(await this.service.listMovimentos(c, req.query));
    },
  );
  getMovimento = this.withClinic(
    "Error getting movimento",
    async (c, req, res) => {
      res.json(await this.service.getMovimento(req.params.id, c));
    },
  );
  createMovimento = this.withClinic(
    "Error creating movimento",
    async (c, req, res) => {
      res.status(201).json(await this.service.createMovimento(c, req.body));
    },
  );
  updateMovimento = this.withClinic(
    "Error updating movimento",
    async (c, req, res) => {
      res.json(await this.service.updateMovimento(req.params.id, c, req.body));
    },
  );
  deleteMovimento = this.withClinic(
    "Error deleting movimento",
    async (c, req, res) => {
      await this.service.deleteMovimento(req.params.id, c);
      res.status(204).send();
    },
  );

  listIncidentes = this.withClinic(
    "Error listing incidentes",
    async (c, req, res) => {
      res.json(await this.service.listIncidentes(c, req.query));
    },
  );
  getIncidente = this.withClinic(
    "Error getting incidente",
    async (c, req, res) => {
      res.json(await this.service.getIncidente(req.params.id, c));
    },
  );
  createIncidente = this.withClinic(
    "Error creating incidente",
    async (c, req, res) => {
      res.status(201).json(await this.service.createIncidente(c, req.body));
    },
  );
  updateIncidente = this.withClinic(
    "Error updating incidente",
    async (c, req, res) => {
      res.json(await this.service.updateIncidente(req.params.id, c, req.body));
    },
  );
  deleteIncidente = this.withClinic(
    "Error deleting incidente",
    async (c, req, res) => {
      await this.service.deleteIncidente(req.params.id, c);
      res.status(204).send();
    },
  );

  listContasReceber = this.withClinic(
    "Error listing contas a receber",
    async (c, _req, res) => {
      res.json(await this.service.listContasReceber(c));
    },
  );
  createContaReceber = this.withClinic(
    "Error creating conta a receber",
    async (c, req, res) => {
      res
        .status(201)
        .json(await this.service.createContaReceber(c, req.user!.id, req.body));
    },
    { needsUserId: true },
  );
  updateContaReceber = this.withClinic(
    "Error updating conta a receber",
    async (c, req, res) => {
      res.json(
        await this.service.updateContaReceber(req.params.id, c, req.body),
      );
    },
  );
  deleteContaReceber = this.withClinic(
    "Error deleting conta a receber",
    async (c, req, res) => {
      await this.service.deleteContaReceber(req.params.id, c);
      res.status(204).send();
    },
  );

  listContasPagar = this.withClinic(
    "Error listing contas a pagar",
    async (c, _req, res) => {
      res.json(await this.service.listContasPagar(c));
    },
  );
  createContaPagar = this.withClinic(
    "Error creating conta a pagar",
    async (c, req, res) => {
      res
        .status(201)
        .json(await this.service.createContaPagar(c, req.user!.id, req.body));
    },
    { needsUserId: true },
  );
  updateContaPagar = this.withClinic(
    "Error updating conta a pagar",
    async (c, req, res) => {
      res.json(await this.service.updateContaPagar(req.params.id, c, req.body));
    },
  );
  deleteContaPagar = this.withClinic(
    "Error deleting conta a pagar",
    async (c, req, res) => {
      await this.service.deleteContaPagar(req.params.id, c);
      res.status(204).send();
    },
  );

  listNotasFiscais = this.withClinic(
    "Error listing notas fiscais",
    async (c, _req, res) => {
      res.json(await this.service.listNotasFiscais(c));
    },
  );
  createNotaFiscal = this.withClinic(
    "Error creating nota fiscal",
    async (c, req, res) => {
      res
        .status(201)
        .json(await this.service.createNotaFiscal(c, req.user!.id, req.body));
    },
    { needsUserId: true },
  );
  updateNotaFiscal = this.withClinic(
    "Error updating nota fiscal",
    async (c, req, res) => {
      res.json(await this.service.updateNotaFiscal(req.params.id, c, req.body));
    },
  );
  deleteNotaFiscal = this.withClinic(
    "Error deleting nota fiscal",
    async (c, req, res) => {
      await this.service.deleteNotaFiscal(req.params.id, c);
      res.status(204).send();
    },
  );

  listVendasPDV = this.withClinic(
    "Error listing vendas PDV",
    async (c, req, res) => {
      res.json(
        await this.service.listVendasPDV(
          c,
          req.query.start_date as string | undefined,
        ),
      );
    },
  );
  listExtratos = this.withClinic(
    "Error listing extratos",
    async (c, req, res) => {
      res.json(
        await this.service.listExtratos(
          c,
          req.query.conciliado !== undefined
            ? req.query.conciliado === "true"
            : undefined,
        ),
      );
    },
  );
  updateExtrato = this.withClinic(
    "Error updating extrato",
    async (c, req, res) => {
      res.json(await this.service.updateExtrato(req.params.id, c, req.body));
    },
  );

  getResumo = this.withClinic(
    "Error getting resumo financeiro",
    async (c, _req, res) => {
      res.json(await this.service.getResumo(c));
    },
  );
  getCashFlow = this.withClinic(
    "Error getting cash flow",
    async (c, req, res) => {
      res.json(
        await this.service.getCashFlow(
          c,
          req.query.startDate as string | undefined,
          req.query.endDate as string | undefined,
        ),
      );
    },
  );

  sincronizarExtratoBancario = this.withClinic(
    "Error syncing extratos",
    async (c, req, res) => {
      res.json(await this.service.sincronizarExtratoBancario(c, req.body));
    },
  );
  sugerirSangriaIa = this.wrap(async (req, res) => {
    res.json(await this.service.sugerirSangriaIa(req.body));
  }, "Error suggesting sangria IA");
  manageFinanceiroJobs = this.wrap(async (_req, res) => {
    res.json(await this.service.manageFinanceiroJobs());
  }, "Error managing financeiro jobs");
  enviarCobranca = this.withClinic(
    "Error in enviar-cobranca",
    async (c, req, res) => {
      res.json(await this.service.enviarCobranca(c, req.body));
    },
  );
  processarPagamento = this.withClinic(
    "Error in processar-pagamento",
    async (c, req, res) => {
      res.json(await this.service.processarPagamento(c, req.body));
    },
  );
  processarPagamentoTef = this.wrap(async (_req, res) => {
    res.json(await this.service.processarPagamentoTef());
  }, "Error in processar-pagamento-tef");
  processarSplitPagamento = this.withClinic(
    "Error in processar-split-pagamento",
    async (c, req, res) => {
      res.json(await this.service.processarSplitPagamento(c, req.body));
    },
  );
}
