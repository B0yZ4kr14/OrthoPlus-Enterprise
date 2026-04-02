import { Request, Response } from 'express';
import { TISSController } from '../../src/modules/tiss/api/controller';

// Mock Prisma client
jest.mock('../../src/infrastructure/database/prismaClient', () => ({
  prisma: {
    tiss_guides: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    tiss_batches: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('../../src/infrastructure/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

import { prisma } from '../../src/infrastructure/database/prismaClient';

const guides = (prisma as any).tiss_guides as Record<string, jest.Mock>;
const batches = (prisma as any).tiss_batches as Record<string, jest.Mock>;

const controller = new TISSController();

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

const sampleGuide = {
  id: 'guide-1',
  clinic_id: 'clinic-1',
  guide_number: 'G-001',
  insurance_company: 'Amil',
  amount: 200,
  service_date: '2025-01-10',
  patient_id: '22222222-2222-2222-2222-222222222222',
  procedure_code: 'P001',
  procedure_name: 'Extração',
  status: 'PENDING',
};

afterEach(() => jest.clearAllMocks());

// ── listGuias ──────────────────────────────────────────────────────────────────
describe('TISSController.listGuias', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listGuias(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns guides for the clinic', async () => {
    guides.findMany.mockResolvedValueOnce([sampleGuide]);
    const req = mockReq();
    const res = mockRes();
    await controller.listGuias(req as Request, res);
    expect(guides.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clinic_id: 'clinic-1' } }),
    );
    expect(res.json).toHaveBeenCalledWith([sampleGuide]);
  });

  it('filters by insurance_company and status', async () => {
    guides.findMany.mockResolvedValueOnce([]);
    const req = mockReq({ query: { insurance_company: 'Amil', status: 'SUBMITTED' } });
    const res = mockRes();
    await controller.listGuias(req as Request, res);
    expect(guides.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clinic_id: 'clinic-1', insurance_company: 'Amil', status: 'SUBMITTED' },
      }),
    );
  });

  it('returns 500 on database error', async () => {
    guides.findMany.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq();
    const res = mockRes();
    await controller.listGuias(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getGuiaById ───────────────────────────────────────────────────────────────
describe('TISSController.getGuiaById', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'guide-1' } });
    const res = mockRes();
    await controller.getGuiaById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when guide not found', async () => {
    guides.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'guide-missing' } });
    const res = mockRes();
    await controller.getGuiaById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns the guide when found', async () => {
    guides.findFirst.mockResolvedValueOnce(sampleGuide);
    const req = mockReq({ params: { id: 'guide-1' } });
    const res = mockRes();
    await controller.getGuiaById(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(sampleGuide);
  });

  it('returns 500 on database error', async () => {
    guides.findFirst.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ params: { id: 'guide-1' } });
    const res = mockRes();
    await controller.getGuiaById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── createGuia ────────────────────────────────────────────────────────────────
describe('TISSController.createGuia', () => {
  const validBody = {
    guide_number: 'G-001',
    insurance_company: 'Amil',
    amount: 200,
    service_date: '2025-01-10',
    patient_id: '22222222-2222-2222-2222-222222222222',
    procedure_code: 'P001',
    procedure_name: 'Extração',
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.createGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body', async () => {
    const req = mockReq({ body: { guide_number: 'G-001' } });
    const res = mockRes();
    await controller.createGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates a guide and returns 201', async () => {
    guides.create.mockResolvedValueOnce({ ...sampleGuide, clinic_id: 'clinic-1' });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.createGuia(req as Request, res);
    expect(guides.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ clinic_id: 'clinic-1' }) }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 on database error', async () => {
    guides.create.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.createGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── updateGuia ────────────────────────────────────────────────────────────────
describe('TISSController.updateGuia', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'guide-1' } });
    const res = mockRes();
    await controller.updateGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when guide not found', async () => {
    guides.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'guide-x' }, body: { status: 'SUBMITTED' } });
    const res = mockRes();
    await controller.updateGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 on invalid body', async () => {
    guides.findFirst.mockResolvedValueOnce(sampleGuide);
    // amount must be a non-negative integer; string is invalid
    const req = mockReq({ params: { id: 'guide-1' }, body: { amount: -1 } });
    const res = mockRes();
    await controller.updateGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates the guide and returns it', async () => {
    guides.findFirst.mockResolvedValueOnce(sampleGuide);
    const updated = { ...sampleGuide, status: 'SUBMITTED' };
    guides.update.mockResolvedValueOnce(updated);
    const req = mockReq({ params: { id: 'guide-1' }, body: { status: 'SUBMITTED' } });
    const res = mockRes();
    await controller.updateGuia(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

// ── deleteGuia ────────────────────────────────────────────────────────────────
describe('TISSController.deleteGuia', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'guide-1' } });
    const res = mockRes();
    await controller.deleteGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when guide not found', async () => {
    guides.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'guide-x' } });
    const res = mockRes();
    await controller.deleteGuia(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletes the guide and returns 204', async () => {
    guides.findFirst.mockResolvedValueOnce(sampleGuide);
    guides.delete.mockResolvedValueOnce(undefined);
    const req = mockReq({ params: { id: 'guide-1' } });
    const res = mockRes();
    await controller.deleteGuia(req as Request, res);
    expect(guides.delete).toHaveBeenCalledWith({ where: { id: 'guide-1' } });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

// ── listLotes ─────────────────────────────────────────────────────────────────
describe('TISSController.listLotes', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listLotes(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns batches for the clinic', async () => {
    batches.findMany.mockResolvedValueOnce([{ id: 'batch-1' }]);
    const req = mockReq();
    const res = mockRes();
    await controller.listLotes(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([{ id: 'batch-1' }]);
  });

  it('filters by status', async () => {
    batches.findMany.mockResolvedValueOnce([]);
    const req = mockReq({ query: { status: 'SUBMITTED' } });
    const res = mockRes();
    await controller.listLotes(req as Request, res);
    expect(batches.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clinic_id: 'clinic-1', status: 'SUBMITTED' } }),
    );
  });
});

// ── createLote ────────────────────────────────────────────────────────────────
describe('TISSController.createLote', () => {
  const validBatch = {
    batch_number: 'LOTE-001',
    insurance_company: 'Amil',
    total_guides: 3,
    total_amount: 600,
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBatch });
    const res = mockRes();
    await controller.createLote(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await controller.createLote(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates a batch and returns 201', async () => {
    batches.create.mockResolvedValueOnce({ id: 'batch-1', ...validBatch });
    const req = mockReq({ body: validBatch });
    const res = mockRes();
    await controller.createLote(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ── submitBatch ───────────────────────────────────────────────────────────────
describe('TISSController.submitBatch', () => {
  const guideId1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const guideId2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const validBody = {
    guide_ids: [guideId1, guideId2],
    insurance_company: 'Amil',
    batch_number: 'LOTE-AUTO-1',
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.submitBatch(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when guide_ids is empty', async () => {
    const req = mockReq({ body: { ...validBody, guide_ids: [] } });
    const res = mockRes();
    await controller.submitBatch(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when some guides are not found', async () => {
    // Only 1 guide returned instead of 2
    guides.findMany.mockResolvedValueOnce([{ id: guideId1, amount: 200 }]);
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.submitBatch(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('not found') }),
    );
  });

  it('creates a batch with correct totals and returns 201', async () => {
    guides.findMany.mockResolvedValueOnce([
      { id: guideId1, amount: 200 },
      { id: guideId2, amount: 300 },
    ]);
    batches.create.mockResolvedValueOnce({
      id: 'batch-new',
      batch_number: 'LOTE-AUTO-1',
      total_amount: 500,
    });
    guides.updateMany.mockResolvedValueOnce({ count: 2 });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.submitBatch(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.total_amount).toBe(500);
    expect(payload.guides_submitted).toBe(2);
  });

  it('returns 500 on database error', async () => {
    guides.findMany.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.submitBatch(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getStatistics ──────────────────────────────────────────────────────────────
describe('TISSController.getStatistics', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.getStatistics(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns aggregated statistics', async () => {
    guides.groupBy.mockResolvedValueOnce([{ status: 'SUBMITTED', _count: { id: 2 }, _sum: { amount: 400 } }]);
    batches.groupBy.mockResolvedValueOnce([{ status: 'SUBMITTED', _count: { id: 1 }, _sum: { total_amount: 400 } }]);
    guides.aggregate.mockResolvedValueOnce({ _count: { id: 2 }, _sum: { amount: 400 } });
    const req = mockReq();
    const res = mockRes();
    await controller.getStatistics(req as Request, res);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.guides.total).toBe(2);
    expect(payload.guides.total_amount).toBe(400);
    expect(Array.isArray(payload.guides.by_status)).toBe(true);
    expect(Array.isArray(payload.batches.by_status)).toBe(true);
  });

  it('returns 500 on database error', async () => {
    guides.groupBy.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq();
    const res = mockRes();
    await controller.getStatistics(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
