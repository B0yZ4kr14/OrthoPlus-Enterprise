import { Request, Response } from 'express';
import { NFeController } from '../../src/modules/nfe/api/controller';

// Mock the repository that is instantiated at module level inside controller.ts
jest.mock('../../src/modules/nfe/infrastructure/repositories/NFeRepositoryPostgres', () => {
  return {
    NFeRepositoryPostgres: jest.fn().mockImplementation(() => ({
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    })),
  };
});

// Mock the logger to avoid noise
jest.mock('../../src/infrastructure/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

import { NFeRepositoryPostgres } from '../../src/modules/nfe/infrastructure/repositories/NFeRepositoryPostgres';

// Save the mock repo instance created when controller.ts was imported (module-level singleton).
// We must save this reference before jest.clearAllMocks() could wipe mock.instances.
type MockRepo = { findAll: jest.Mock; findById: jest.Mock; save: jest.Mock; update: jest.Mock };
let mockRepo: MockRepo;

const controller = new NFeController();

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

beforeAll(() => {
  mockRepo = (NFeRepositoryPostgres as unknown as jest.Mock).mock.results[0].value as MockRepo;
});

afterEach(() => {
  // Reset individual mocks without clearing the instances array
  mockRepo.findAll.mockReset();
  mockRepo.findById.mockReset();
  mockRepo.save.mockReset();
  mockRepo.update.mockReset();
});

const sampleNFe = {
  id: 'nfe-id-1',
  clinicId: 'clinic-1',
  numero: '000001',
  serie: '001',
  tipo: 'NFE',
  status: 'RASCUNHO',
  chaveAcesso: null,
  xml: null,
  pdfUrl: null,
  clienteId: 'client-1',
  clienteNome: 'Test Client',
  valorTotal: 100,
  dataEmissao: new Date('2025-01-01'),
  protocolo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  cancelar: jest.fn(),
};

// ── list ──────────────────────────────────────────────────────────────────────
describe('NFeController.list', () => {
  it('returns 401 when no clinicId on user', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.list(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing clinic context' });
  });

  it('calls repository.findAll and returns result', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ items: [sampleNFe], total: 1 });
    const req = mockReq({ query: { status: 'RASCUNHO', take: '10', skip: '0' } });
    const res = mockRes();
    await controller.list(req as Request, res);
    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'clinic-1', status: 'RASCUNHO', take: 10, skip: 0 }),
    );
    expect(res.json).toHaveBeenCalledWith({ items: [sampleNFe], total: 1 });
  });

  it('passes tipo and cliente_id filters', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ items: [], total: 0 });
    const req = mockReq({ query: { tipo: 'NFCE', cliente_id: 'abc-123' } });
    const res = mockRes();
    await controller.list(req as Request, res);
    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'NFCE', clienteId: 'abc-123' }),
    );
  });

  it('returns 500 on repository error', async () => {
    mockRepo.findAll.mockRejectedValueOnce(new Error('DB error'));
    const req = mockReq();
    const res = mockRes();
    await controller.list(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getById ──────────────────────────────────────────────────────────────────
describe('NFeController.getById', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when NFe not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'nfe-missing' } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 when NFe belongs to different clinic', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...sampleNFe, clinicId: 'OTHER-clinic' });
    const req = mockReq({ params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns NFe when found and belongs to clinic', async () => {
    mockRepo.findById.mockResolvedValueOnce(sampleNFe);
    const req = mockReq({ params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(sampleNFe);
  });

  it('returns 500 on repository error', async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── create ────────────────────────────────────────────────────────────────────
describe('NFeController.create', () => {
  const validBody = {
    numero: '000001',
    serie: '001',
    tipo: 'NFE',
    cliente_id: '11111111-1111-1111-1111-111111111111',
    cliente_nome: 'Cliente Teste',
    valor_total: 150,
    data_emissao: '2025-01-01',
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body (missing required fields)', async () => {
    const req = mockReq({ body: { numero: '000001' } });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid input' }));
  });

  it('returns 400 on invalid tipo enum value', async () => {
    const req = mockReq({ body: { ...validBody, tipo: 'INVALID' } });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('saves NFe and returns 201 on valid data', async () => {
    mockRepo.save.mockResolvedValueOnce(undefined);
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    const saved = (res.json as jest.Mock).mock.calls[0][0];
    expect(saved.status).toBe('RASCUNHO');
    expect(saved.clinicId).toBe('clinic-1');
  });

  it('returns 500 when repository throws', async () => {
    mockRepo.save.mockRejectedValueOnce(new Error('DB error'));
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── update ────────────────────────────────────────────────────────────────────
describe('NFeController.update', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when NFe not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'nfe-x' }, body: { status: 'AUTORIZADA' } });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 on invalid update body (bad status value)', async () => {
    mockRepo.findById.mockResolvedValueOnce(sampleNFe);
    const req = mockReq({
      params: { id: 'nfe-id-1' },
      body: { status: 'INVALID_STATUS' },
    });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates fields and returns the NFe', async () => {
    const nfeCopy = { ...sampleNFe, cancelar: jest.fn() };
    mockRepo.findById.mockResolvedValueOnce(nfeCopy);
    mockRepo.update.mockResolvedValueOnce(undefined);
    const req = mockReq({
      params: { id: 'nfe-id-1' },
      body: { status: 'AUTORIZADA', chave_acesso: 'CHAVE-ABC', protocolo: 'PROTO-1' },
    });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(nfeCopy.status).toBe('AUTORIZADA');
    expect(nfeCopy.chaveAcesso).toBe('CHAVE-ABC');
    expect(nfeCopy.protocolo).toBe('PROTO-1');
    expect(mockRepo.update).toHaveBeenCalledWith(nfeCopy);
    expect(res.json).toHaveBeenCalledWith(nfeCopy);
  });

  it('returns 500 on repository error', async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ params: { id: 'nfe-id-1' }, body: {} });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── cancel ────────────────────────────────────────────────────────────────────
describe('NFeController.cancel', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.cancel(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when NFe not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'nfe-x' } });
    const res = mockRes();
    await controller.cancel(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 422 when domain cancelar throws (e.g. not AUTORIZADA)', async () => {
    const nfeCopy = {
      ...sampleNFe,
      status: 'RASCUNHO',
      cancelar: jest.fn(() => { throw new Error('Apenas NFe autorizada pode ser cancelada'); }),
    };
    mockRepo.findById.mockResolvedValueOnce(nfeCopy);
    const req = mockReq({ params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.cancel(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ error: 'Apenas NFe autorizada pode ser cancelada' });
  });

  it('cancels and returns the NFe when AUTORIZADA', async () => {
    const nfeCopy = { ...sampleNFe, status: 'AUTORIZADA', cancelar: jest.fn() };
    mockRepo.findById.mockResolvedValueOnce(nfeCopy);
    mockRepo.update.mockResolvedValueOnce(undefined);
    const req = mockReq({ params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.cancel(req as Request, res);
    expect(nfeCopy.cancelar).toHaveBeenCalled();
    expect(mockRepo.update).toHaveBeenCalledWith(nfeCopy);
    expect(res.json).toHaveBeenCalledWith(nfeCopy);
  });

  it('returns 500 on repository error', async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ params: { id: 'nfe-id-1' } });
    const res = mockRes();
    await controller.cancel(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── status ────────────────────────────────────────────────────────────────────
describe('NFeController.status', () => {
  it('returns module status information', async () => {
    const req = mockReq();
    const res = mockRes();
    await controller.status(req as Request, res);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.module).toBe('NFE');
    expect(payload.status).toBe('active');
    expect(Array.isArray(payload.endpoints)).toBe(true);
  });
});
