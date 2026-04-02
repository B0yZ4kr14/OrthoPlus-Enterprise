import { Request, Response } from 'express';
import { SplitPagamentoController } from '../../src/modules/split_pagamento/api/controller';

jest.mock('../../src/infrastructure/database/prismaClient', () => ({
  prisma: {
    split_payment_config: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    split_comissoes: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    split_transactions: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../src/infrastructure/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

import { prisma } from '../../src/infrastructure/database/prismaClient';

const splitConfig = (prisma as any).split_payment_config as Record<string, jest.Mock>;
const splitComissoes = (prisma as any).split_comissoes as Record<string, jest.Mock>;
const splitTransactions = (prisma as any).split_transactions as Record<string, jest.Mock>;

const controller = new SplitPagamentoController();

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = (
  overrides: Partial<{
    user: Partial<Request['user']>;
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
  }> = {},
): Partial<Request> => ({
  user: { clinicId: 'clinic-1', id: 'user-1', role: 'ADMIN' } as Request['user'],
  body: {},
  params: {} as Record<string, string>,
  query: {},
  ...overrides,
});

const professionalId = '33333333-3333-3333-3333-333333333333';
const transactionId = '44444444-4444-4444-4444-444444444444';

const sampleConfig = {
  id: 'cfg-1',
  clinic_id: 'clinic-1',
  professional_id: professionalId,
  percentage: 40,
  is_active: true,
};

afterEach(() => jest.clearAllMocks());

// ── getConfig ─────────────────────────────────────────────────────────────────
describe('SplitPagamentoController.getConfig', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.getConfig(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns config list for clinic', async () => {
    splitConfig.findMany.mockResolvedValueOnce([sampleConfig]);
    const req = mockReq();
    const res = mockRes();
    await controller.getConfig(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([sampleConfig]);
  });

  it('returns 500 on database error', async () => {
    splitConfig.findMany.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq();
    const res = mockRes();
    await controller.getConfig(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── upsertConfig ──────────────────────────────────────────────────────────────
describe('SplitPagamentoController.upsertConfig', () => {
  const validBody = { professional_id: professionalId, percentage: 30, is_active: true };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.upsertConfig(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body (percentage > 100)', async () => {
    const req = mockReq({ body: { professional_id: professionalId, percentage: 150 } });
    const res = mockRes();
    await controller.upsertConfig(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates config when none exists', async () => {
    splitConfig.findFirst.mockResolvedValueOnce(null);
    splitConfig.create.mockResolvedValueOnce({ ...sampleConfig, percentage: 30 });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.upsertConfig(req as Request, res);
    expect(splitConfig.create).toHaveBeenCalled();
    expect(splitConfig.update).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('updates config when one already exists', async () => {
    splitConfig.findFirst.mockResolvedValueOnce(sampleConfig);
    splitConfig.update.mockResolvedValueOnce({ ...sampleConfig, percentage: 30 });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.upsertConfig(req as Request, res);
    expect(splitConfig.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cfg-1' } }),
    );
    expect(splitConfig.create).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    splitConfig.findFirst.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.upsertConfig(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── listComissoes ─────────────────────────────────────────────────────────────
describe('SplitPagamentoController.listComissoes', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listComissoes(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns all comissoes for clinic', async () => {
    splitComissoes.findMany.mockResolvedValueOnce([{ id: 'com-1' }]);
    const req = mockReq();
    const res = mockRes();
    await controller.listComissoes(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 'com-1' }]);
  });

  it('filters by professional_id', async () => {
    splitComissoes.findMany.mockResolvedValueOnce([]);
    const req = mockReq({ query: { professional_id: professionalId } });
    const res = mockRes();
    await controller.listComissoes(req as Request, res);
    expect(splitComissoes.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ professional_id: professionalId }),
      }),
    );
  });
});

// ── createComissao ────────────────────────────────────────────────────────────
describe('SplitPagamentoController.createComissao', () => {
  const validBody = {
    professional_id: professionalId,
    amount: 120,
    percentage: 30,
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.createComissao(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body', async () => {
    const req = mockReq({ body: { amount: -1 } });
    const res = mockRes();
    await controller.createComissao(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates comissao and returns 201', async () => {
    splitComissoes.create.mockResolvedValueOnce({ id: 'com-new', ...validBody });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.createComissao(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ── listTransacoes ────────────────────────────────────────────────────────────
describe('SplitPagamentoController.listTransacoes', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listTransacoes(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns all transactions for clinic', async () => {
    splitTransactions.findMany.mockResolvedValueOnce([{ id: 'txn-split-1' }]);
    const req = mockReq();
    const res = mockRes();
    await controller.listTransacoes(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 'txn-split-1' }]);
  });

  it('filters by status', async () => {
    splitTransactions.findMany.mockResolvedValueOnce([]);
    const req = mockReq({ query: { status: 'PENDING' } });
    const res = mockRes();
    await controller.listTransacoes(req as Request, res);
    expect(splitTransactions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PENDING' }) }),
    );
  });
});

// ── calculateSplit ────────────────────────────────────────────────────────────
describe('SplitPagamentoController.calculateSplit', () => {
  const validBody = {
    transaction_id: transactionId,
    total_amount: 1000,
    professional_id: professionalId,
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.calculateSplit(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body (total_amount not positive)', async () => {
    const req = mockReq({ body: { ...validBody, total_amount: 0 } });
    const res = mockRes();
    await controller.calculateSplit(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when no active config found', async () => {
    splitConfig.findFirst.mockResolvedValue(null);
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.calculateSplit(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('calculates split amounts correctly', async () => {
    // Config: 40% to professional
    splitConfig.findFirst.mockResolvedValueOnce({ ...sampleConfig, percentage: 40 });
    const expectedProfAmt = Math.round(1000 * 40 / 100); // 400
    const expectedClinicAmt = 1000 - expectedProfAmt; // 600

    splitTransactions.create.mockResolvedValueOnce({
      id: 'split-txn-1',
      professional_amount: expectedProfAmt,
      clinic_amount: expectedClinicAmt,
      percentage: 40,
    });
    splitComissoes.create.mockResolvedValueOnce({
      id: 'com-1',
      amount: expectedProfAmt,
      percentage: 40,
    });

    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.calculateSplit(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.summary.professional_amount).toBe(expectedProfAmt);
    expect(payload.summary.clinic_amount).toBe(expectedClinicAmt);
    expect(payload.summary.percentage).toBe(40);
    expect(payload.summary.total_amount).toBe(1000);
  });

  it('falls back to config without procedure_type when not found with it', async () => {
    // First call (with procedure_type) returns null; second call (without) returns config
    splitConfig.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...sampleConfig, percentage: 35 });

    splitTransactions.create.mockResolvedValueOnce({ id: 'split-1' });
    splitComissoes.create.mockResolvedValueOnce({ id: 'com-1' });

    const req = mockReq({ body: { ...validBody, procedure_type: 'ORTODONTIA' } });
    const res = mockRes();
    await controller.calculateSplit(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(201);
    // Both findFirst calls occurred (with and without procedure_type)
    expect(splitConfig.findFirst).toHaveBeenCalledTimes(2);
  });

  it('returns 422 when config percentage is invalid (>100)', async () => {
    splitConfig.findFirst.mockResolvedValueOnce({ ...sampleConfig, percentage: 150 });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.calculateSplit(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('returns 500 on database error', async () => {
    splitConfig.findFirst.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.calculateSplit(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
