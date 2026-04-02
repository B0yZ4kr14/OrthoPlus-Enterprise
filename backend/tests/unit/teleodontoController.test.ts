import { Request, Response } from 'express';
import { TeleodontoController } from '../../src/modules/teleodonto/api/controller';

jest.mock('../../src/infrastructure/database/prismaClient', () => ({
  prisma: {
    teleconsultas: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    teleconsulta_prescricoes: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../src/infrastructure/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

import { prisma } from '../../src/infrastructure/database/prismaClient';

const consultas = (prisma as any).teleconsultas as Record<string, jest.Mock>;

const controller = new TeleodontoController();

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

const patientId = '11111111-1111-1111-1111-111111111111';
const dentistId = '22222222-2222-2222-2222-222222222222';
const teleconsultaId = '33333333-3333-3333-3333-333333333333';

const sampleConsulta = {
  id: teleconsultaId,
  clinic_id: 'clinic-1',
  titulo: 'Consulta Ortodoncia',
  motivo: 'Dor de dente',
  tipo: 'VIDEO',
  data_agendada: '2025-06-01T10:00:00Z',
  patient_id: patientId,
  dentist_id: dentistId,
  status: 'AGENDADO',
};

afterEach(() => jest.clearAllMocks());

// ── listTeleconsultas ─────────────────────────────────────────────────────────
describe('TeleodontoController.listTeleconsultas', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    await controller.listTeleconsultas(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns list of teleconsultas', async () => {
    consultas.findMany.mockResolvedValueOnce([sampleConsulta]);
    const req = mockReq();
    const res = mockRes();
    await controller.listTeleconsultas(req as Request, res);
    expect(res.json).toHaveBeenCalledWith([sampleConsulta]);
  });

  it('filters by status and dentist_id', async () => {
    consultas.findMany.mockResolvedValueOnce([]);
    const req = mockReq({ query: { status: 'AGENDADO', dentist_id: dentistId } });
    const res = mockRes();
    await controller.listTeleconsultas(req as Request, res);
    expect(consultas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'AGENDADO', dentist_id: dentistId }),
      }),
    );
  });

  it('returns 500 on database error', async () => {
    consultas.findMany.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq();
    const res = mockRes();
    await controller.listTeleconsultas(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getById ───────────────────────────────────────────────────────────────────
describe('TeleodontoController.getById', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: teleconsultaId } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when not found', async () => {
    consultas.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'missing-id' } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns the teleconsulta when found', async () => {
    consultas.findFirst.mockResolvedValueOnce(sampleConsulta);
    const req = mockReq({ params: { id: teleconsultaId } });
    const res = mockRes();
    await controller.getById(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(sampleConsulta);
  });
});

// ── create ────────────────────────────────────────────────────────────────────
describe('TeleodontoController.create', () => {
  const validBody = {
    titulo: 'Consulta Geral',
    motivo: 'Check-up',
    tipo: 'VIDEO',
    data_agendada: '2025-06-15T14:00:00Z',
    patient_id: patientId,
    dentist_id: dentistId,
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validBody });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body', async () => {
    const req = mockReq({ body: { titulo: 'T' } });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates teleconsulta and returns 201', async () => {
    consultas.create.mockResolvedValueOnce({ ...sampleConsulta });
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 on database error', async () => {
    consultas.create.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ body: validBody });
    const res = mockRes();
    await controller.create(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── update ────────────────────────────────────────────────────────────────────
describe('TeleodontoController.update', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: teleconsultaId } });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when not found', async () => {
    consultas.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ params: { id: 'missing' }, body: { status: 'CONCLUIDO' } });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updates and returns the teleconsulta', async () => {
    consultas.findFirst.mockResolvedValueOnce(sampleConsulta);
    const updated = { ...sampleConsulta, status: 'CONCLUIDO' };
    consultas.update.mockResolvedValueOnce(updated);
    const req = mockReq({ params: { id: teleconsultaId }, body: { status: 'CONCLUIDO' } });
    const res = mockRes();
    await controller.update(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

// ── startSession ──────────────────────────────────────────────────────────────
describe('TeleodontoController.startSession', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: { teleconsulta_id: teleconsultaId } });
    const res = mockRes();
    await controller.startSession(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body (missing teleconsulta_id)', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await controller.startSession(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when teleconsulta not found', async () => {
    consultas.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ body: { teleconsulta_id: teleconsultaId } });
    const res = mockRes();
    await controller.startSession(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('starts the session and returns updated data', async () => {
    consultas.findFirst.mockResolvedValueOnce(sampleConsulta);
    const updated = { ...sampleConsulta, status: 'EM_ANDAMENTO', started_at: new Date().toISOString() };
    consultas.update.mockResolvedValueOnce(updated);
    const req = mockReq({ body: { teleconsulta_id: teleconsultaId } });
    const res = mockRes();
    await controller.startSession(req as Request, res);
    expect(consultas.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'EM_ANDAMENTO' }),
      }),
    );
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toBe('Session started successfully');
  });

  it('returns 500 on database error', async () => {
    consultas.findFirst.mockRejectedValueOnce(new Error('DB'));
    const req = mockReq({ body: { teleconsulta_id: teleconsultaId } });
    const res = mockRes();
    await controller.startSession(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── endSession ────────────────────────────────────────────────────────────────
describe('TeleodontoController.endSession', () => {
  const validEndBody = {
    teleconsulta_id: teleconsultaId,
    duration_minutes: 30,
    notes: 'Sessão concluída com sucesso',
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validEndBody });
    const res = mockRes();
    await controller.endSession(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body (duration_minutes negative)', async () => {
    const req = mockReq({ body: { teleconsulta_id: teleconsultaId, duration_minutes: -5 } });
    const res = mockRes();
    await controller.endSession(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when teleconsulta not found', async () => {
    consultas.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ body: validEndBody });
    const res = mockRes();
    await controller.endSession(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('ends the session with duration and notes', async () => {
    consultas.findFirst.mockResolvedValueOnce(sampleConsulta);
    const updated = { ...sampleConsulta, status: 'CONCLUIDO', duracao_minutos: 30 };
    consultas.update.mockResolvedValueOnce(updated);
    const req = mockReq({ body: validEndBody });
    const res = mockRes();
    await controller.endSession(req as Request, res);
    expect(consultas.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CONCLUIDO', duracao_minutos: 30 }),
      }),
    );
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toBe('Session ended successfully');
  });
});

// ── addNotes ──────────────────────────────────────────────────────────────────
describe('TeleodontoController.addNotes', () => {
  const validNotes = {
    teleconsulta_id: teleconsultaId,
    notes: 'Paciente apresentou dor',
    diagnosis: 'Cárie',
    recommendations: 'Evitar açúcar',
  };

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, body: validNotes });
    const res = mockRes();
    await controller.addNotes(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid body (missing notes)', async () => {
    const req = mockReq({ body: { teleconsulta_id: teleconsultaId } });
    const res = mockRes();
    await controller.addNotes(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when teleconsulta not found', async () => {
    consultas.findFirst.mockResolvedValueOnce(null);
    const req = mockReq({ body: validNotes });
    const res = mockRes();
    await controller.addNotes(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('adds notes and returns updated teleconsulta', async () => {
    consultas.findFirst.mockResolvedValueOnce(sampleConsulta);
    const updated = { ...sampleConsulta, observacoes: validNotes.notes, diagnosis: validNotes.diagnosis };
    consultas.update.mockResolvedValueOnce(updated);
    const req = mockReq({ body: validNotes });
    const res = mockRes();
    await controller.addNotes(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});
