import { Request, Response } from "express";
import { FinanceiroController } from "../../src/modules/financeiro/api/FinanceiroController";

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    financial_transactions: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    financial_categories: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cash_registers: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    contas_receber: {
      aggregate: jest.fn(),
    },
    contas_pagar: {
      aggregate: jest.fn(),
    },
  },
}));

jest.mock("../../src/infrastructure/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { prisma } from "../../src/infrastructure/database/prismaClient";

const transactions = (prisma as any).financial_transactions as Record<
  string,
  jest.Mock
>;
const categories = (prisma as any).financial_categories as Record<
  string,
  jest.Mock
>;
const cashRegisters = (prisma as any).cash_registers as Record<
  string,
  jest.Mock
>;
const contasReceber = (prisma as any).contas_receber as Record<
  string,
  jest.Mock
>;
const contasPagar = (prisma as any).contas_pagar as Record<string, jest.Mock>;

const controller = new FinanceiroController();

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = (
  overrides: Partial<{
    user: Partial<Request["user"]>;
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
  }> = {},
): Partial<Request> => ({
  user: {
    clinicId: "clinic-1",
    id: "user-1",
    role: "ADMIN",
  } as Request["user"],
  body: {},
  params: {} as Record<string, string>,
  query: {},
  ...overrides,
});

const sampleTransaction = {
  id: "txn-1",
  clinic_id: "clinic-1",
  type: "RECEITA",
  amount: 500,
  status: "PENDENTE",
};

const sampleCategory = {
  id: "cat-1",
  clinic_id: "clinic-1",
  name: "Consultas",
  type: "RECEITA",
  is_active: true,
};

afterEach(() => jest.clearAllMocks());

// ── listTransactions ──────────────────────────────────────────────────────────
describe("FinanceiroController.listTransactions", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listTransactions(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns transactions for the clinic", async () => {
    transactions.findMany.mockResolvedValueOnce([sampleTransaction]);
    const req = mockReq();
    const res = mockRes();
    await controller.listTransactions(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([sampleTransaction]);
  });

  it("filters by type, status, and date range", async () => {
    transactions.findMany.mockResolvedValueOnce([]);
    const req = mockReq({
      query: {
        type: "RECEITA",
        status: "PAGO",
        start_date: "2025-01-01",
        end_date: "2025-01-31",
      },
    });
    const res = mockRes();
    await controller.listTransactions(req as Request, res);
    expect(transactions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: "RECEITA",
          status: "PAGO",
          transaction_date: { gte: "2025-01-01", lte: "2025-01-31" },
        }),
      }),
    );
  });

  it("returns 500 on database error", async () => {
    transactions.findMany.mockRejectedValueOnce(new Error("DB"));
    const req = mockReq();
    const res = mockRes();
    await controller.listTransactions(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getTransaction ────────────────────────────────────────────────────────────
describe("FinanceiroController.getTransaction", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined, params: { id: "txn-1" } });
    const res = mockRes();
    await controller.getTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 404 when not found", async () => {
    transactions.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: "txn-missing" } });
    const res = mockRes();
    await controller.getTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns the transaction when found", async () => {
    transactions.findFirst.mockResolvedValueOnce(sampleTransaction);
    const req = mockReq({ params: { id: "txn-1" } });
    const res = mockRes();
    await controller.getTransaction(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(sampleTransaction);
  });
});

// ── createTransaction ─────────────────────────────────────────────────────────
describe("FinanceiroController.createTransaction", () => {
  const validBody = { type: "RECEITA", amount: 500 };

  it("returns 401 when no user", async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.createTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 on invalid body (negative amount)", async () => {
    const req = mockReq({ body: { type: "RECEITA", amount: -10 } });
    const res = mockRes();
    await controller.createTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("creates transaction and returns 201", async () => {
    transactions.create.mockResolvedValueOnce({ ...sampleTransaction });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.createTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 500 on database error", async () => {
    transactions.create.mockRejectedValueOnce(new Error("DB"));
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.createTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── updateTransaction ─────────────────────────────────────────────────────────
describe("FinanceiroController.updateTransaction", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined, params: { id: "txn-1" } });
    const res = mockRes();
    await controller.updateTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 404 when transaction not found", async () => {
    transactions.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: "txn-x" }, body: { status: "PAGO" } });
    const res = mockRes();
    await controller.updateTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates and returns transaction", async () => {
    transactions.findFirst.mockResolvedValueOnce(sampleTransaction);
    const updated = { ...sampleTransaction, status: "PAGO" };
    transactions.update.mockResolvedValueOnce(updated);
    const req = mockReq({ params: { id: "txn-1" }, body: { status: "PAGO" } });
    const res = mockRes();
    await controller.updateTransaction(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

// ── deleteTransaction ─────────────────────────────────────────────────────────
describe("FinanceiroController.deleteTransaction", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined, params: { id: "txn-1" } });
    const res = mockRes();
    await controller.deleteTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 404 when not found", async () => {
    transactions.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: "txn-x" } });
    const res = mockRes();
    await controller.deleteTransaction(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deletes and returns 204", async () => {
    transactions.findFirst.mockResolvedValueOnce(sampleTransaction);
    transactions.delete.mockResolvedValueOnce(undefined);
    const req = mockReq({ params: { id: "txn-1" } });
    const res = mockRes();
    await controller.deleteTransaction(req as Request, res);
    expect(transactions.delete).toHaveBeenCalledWith({
      where: { id: "txn-1", clinic_id: "clinic-1" },
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

// ── markTransactionAsPaid ─────────────────────────────────────────────────────
describe("FinanceiroController.markTransactionAsPaid", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined, params: { id: "txn-1" } });
    const res = mockRes();
    await controller.markTransactionAsPaid(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 404 when transaction not found", async () => {
    transactions.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: "txn-x" } });
    const res = mockRes();
    await controller.markTransactionAsPaid(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("marks transaction as paid and returns updated data", async () => {
    transactions.findFirst.mockResolvedValueOnce(sampleTransaction);
    const paid = {
      ...sampleTransaction,
      status: "PAGO",
      paid_date: new Date().toISOString(),
    };
    transactions.update.mockResolvedValueOnce(paid);
    const req = mockReq({ params: { id: "txn-1" } });
    const res = mockRes();
    await controller.markTransactionAsPaid(req as Request, res);
    expect(transactions.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PAGO" }),
      }),
    );
    expect(res.json).toHaveBeenCalledWith(paid);
  });

  it("returns 500 on database error", async () => {
    transactions.findFirst.mockRejectedValueOnce(new Error("DB"));
    const req = mockReq({ params: { id: "txn-1" } });
    const res = mockRes();
    await controller.markTransactionAsPaid(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── listCategories ────────────────────────────────────────────────────────────
describe("FinanceiroController.listCategories", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listCategories(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns categories for clinic", async () => {
    categories.findMany.mockResolvedValueOnce([sampleCategory]);
    const req = mockReq();
    const res = mockRes();
    await controller.listCategories(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([sampleCategory]);
  });
});

// ── createCategory ────────────────────────────────────────────────────────────
describe("FinanceiroController.createCategory", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined, body: { name: "Consultas" } });
    const res = mockRes();
    await controller.createCategory(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 on invalid body (empty name)", async () => {
    const req = mockReq({ body: { name: "" } });
    const res = mockRes();
    await controller.createCategory(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("creates category and returns 201", async () => {
    categories.create.mockResolvedValueOnce(sampleCategory);
    const req = mockReq({ body: { name: "Consultas" } });
    const res = mockRes();
    await controller.createCategory(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ── deleteCategory ────────────────────────────────────────────────────────────
describe("FinanceiroController.deleteCategory", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined, params: { id: "cat-1" } });
    const res = mockRes();
    await controller.deleteCategory(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 404 when category not found", async () => {
    categories.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: "cat-x" } });
    const res = mockRes();
    await controller.deleteCategory(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deletes and returns 204", async () => {
    categories.findFirst.mockResolvedValueOnce(sampleCategory);
    categories.delete.mockResolvedValueOnce(undefined);
    const req = mockReq({ params: { id: "cat-1" } });
    const res = mockRes();
    await controller.deleteCategory(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});

// ── listCashRegisters ─────────────────────────────────────────────────────────
describe("FinanceiroController.listCashRegisters", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listCashRegisters(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns cash registers for clinic", async () => {
    cashRegisters.findMany.mockResolvedValueOnce([{ id: "cr-1" }]);
    const req = mockReq();
    const res = mockRes();
    await controller.listCashRegisters(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([{ id: "cr-1" }]);
  });
});

// ── getResumo ─────────────────────────────────────────────────────────────────
describe("FinanceiroController.getResumo", () => {
  it("returns 401 when no clinicId", async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.getResumo(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns financial summary successfully", async () => {
    transactions.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 10000 } }) // totalReceitas
      .mockResolvedValueOnce({ _sum: { amount: 3000 } }); // totalDespesas

    contasReceber.aggregate.mockResolvedValueOnce({
      _sum: { valor: 5000 },
      _count: { id: 3 },
    });
    contasPagar.aggregate.mockResolvedValueOnce({
      _sum: { valor: 2000 },
      _count: { id: 2 },
    });
    cashRegisters.count.mockResolvedValueOnce(1);

    const req = mockReq();
    const res = mockRes();
    await controller.getResumo(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      saldoGeral: 7000,
      totalReceitas: 10000,
      totalDespesas: 3000,
      contasReceber: { total: 5000, quantidade: 3 },
      contasPagar: { total: 2000, quantidade: 2 },
      caixasAbertos: 1,
    });
  });

  it("returns fallback caixasAbertos=0 when cash_registers table does not exist (P2021)", async () => {
    transactions.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 0 } })
      .mockResolvedValueOnce({ _sum: { amount: 0 } });

    contasReceber.aggregate.mockResolvedValueOnce({
      _sum: { valor: 0 },
      _count: { id: 0 },
    });
    contasPagar.aggregate.mockResolvedValueOnce({
      _sum: { valor: 0 },
      _count: { id: 0 },
    });

    const p2021Error = new Error("Table not found") as any;
    p2021Error.code = "P2021";
    p2021Error.meta = { table: "pdv.cash_registers" };
    cashRegisters.count.mockRejectedValueOnce(p2021Error);

    const req = mockReq();
    const res = mockRes();
    await controller.getResumo(req as Request, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        caixasAbertos: 0,
        saldoGeral: 0,
      }),
    );
  });

  it("returns 500 on unexpected database error", async () => {
    transactions.aggregate.mockRejectedValueOnce(new Error("DB"));

    const req = mockReq();
    const res = mockRes();
    await controller.getResumo(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
