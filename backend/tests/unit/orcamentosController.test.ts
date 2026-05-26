import { Request, Response } from 'express'
import { OrcamentosController } from '../../src/modules/orcamentos/api/controller'

jest.mock('../../src/infrastructure/database/prismaClient', () => ({
  prisma: {
    orcamentos: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orcamento_itens: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('../../src/infrastructure/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}))

import { prisma } from '../../src/infrastructure/database/prismaClient'

const orcamentos = (prisma as any).orcamentos as Record<string, jest.Mock>
const orcamentoItens = (prisma as any).orcamento_itens as Record<string, jest.Mock>

const controller = new OrcamentosController()

const mockRes = () => {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res as Response
}

const mockReq = (
  overrides: Partial<{
    user: Partial<Request['user']>
    body: unknown
    params: Record<string, string>
    query: Record<string, string>
  }> = {},
): Partial<Request> => ({
  user: { clinicId: 'clinic-1', id: 'user-1', role: 'ADMIN' } as Request['user'],
  body: {},
  params: {} as Record<string, string>,
  query: {},
  ...overrides,
})

const sampleOrcamento = {
  id: 'orc-1',
  clinic_id: 'clinic-1',
  patient_id: 'patient-1',
  numero_orcamento: 'ORC-001',
  titulo: 'Orçamento Teste',
  tipo_plano: 'PADRAO',
  status: 'RASCUNHO',
  valor_total: 1000,
  valor_final: 1000,
  validade_dias: 30,
  data_validade: new Date().toISOString(),
  created_by: 'user-1',
  created_at: new Date(),
  updated_at: new Date(),
}

const sampleItem = {
  id: 'item-1',
  orcamento_id: 'orc-1',
  descricao: 'Limpeza',
  ordem: 1,
  quantidade: 1,
  valor_unitario: 100,
  valor_total: 100,
}

afterEach(() => jest.clearAllMocks())

// ── list ──────────────────────────────────────────────────────────────────────
describe('OrcamentosController.list', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined })
    const res = mockRes()
    await controller.list(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns orcamentos for the clinic', async () => {
    orcamentos.findMany.mockResolvedValueOnce([sampleOrcamento])
    const req = mockReq()
    const res = mockRes()
    await controller.list(req as Request, res)
    expect(res.json).toHaveBeenCalledWith([sampleOrcamento])
  })

  it('filters by patient_id and status', async () => {
    orcamentos.findMany.mockResolvedValueOnce([])
    const req = mockReq({ query: { patient_id: 'patient-1', status: 'PENDENTE' } })
    const res = mockRes()
    await controller.list(req as Request, res)
    expect(orcamentos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          clinic_id: 'clinic-1',
          patient_id: 'patient-1',
          status: 'PENDENTE',
        }),
      }),
    )
  })

  it('returns 500 on database error', async () => {
    orcamentos.findMany.mockRejectedValueOnce(new Error('DB'))
    const req = mockReq()
    const res = mockRes()
    await expect(controller.list(req as Request, res)).rejects.toThrow('DB')
  })
})

// ── getById ───────────────────────────────────────────────────────────────────
describe('OrcamentosController.getById', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.getById(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 404 when not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { id: 'orc-missing' } })
    const res = mockRes()
    await controller.getById(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns the orcamento when found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(sampleOrcamento)
    const req = mockReq({ params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.getById(req as Request, res)
    expect(res.json).toHaveBeenCalledWith(sampleOrcamento)
  })
})

// ── create ────────────────────────────────────────────────────────────────────
describe('OrcamentosController.create', () => {
  const validBody = {
    numero_orcamento: 'ORC-002',
    titulo: 'Novo Orçamento',
    patient_id: '550e8400-e29b-41d4-a716-446655440000',
    tipo_plano: 'PADRAO',
    data_validade: new Date().toISOString(),
    valor_total: 500,
  }

  it('returns 401 when no user', async () => {
    const req = mockReq({ user: undefined, body: validBody })
    const res = mockRes()
    await controller.create(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 400 on invalid body', async () => {
    const req = mockReq({ body: { ...validBody, valor_total: -10 } })
    const res = mockRes()
    await controller.create(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('creates orcamento and returns 201', async () => {
    orcamentos.create.mockResolvedValueOnce({ ...sampleOrcamento, id: 'orc-2' })
    const req = mockReq({ body: validBody })
    const res = mockRes()
    await controller.create(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('returns 500 on database error', async () => {
    orcamentos.create.mockRejectedValueOnce(new Error('DB'))
    const req = mockReq({ body: validBody })
    const res = mockRes()
    await expect(controller.create(req as Request, res)).rejects.toThrow('DB')
  })
})

// ── update ────────────────────────────────────────────────────────────────────
describe('OrcamentosController.update', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.update(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 404 when orcamento not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { id: 'orc-x' }, body: { titulo: 'Atualizado' } })
    const res = mockRes()
    await controller.update(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('updates and returns orcamento', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(sampleOrcamento)
    const updated = { ...sampleOrcamento, titulo: 'Atualizado' }
    orcamentos.update.mockResolvedValueOnce(updated)
    const req = mockReq({ params: { id: 'orc-1' }, body: { titulo: 'Atualizado' } })
    const res = mockRes()
    await controller.update(req as Request, res)
    expect(res.json).toHaveBeenCalledWith(updated)
  })
})

// ── delete ────────────────────────────────────────────────────────────────────
describe('OrcamentosController.delete', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.delete(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 404 when not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { id: 'orc-x' } })
    const res = mockRes()
    await controller.delete(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('deletes and returns 204', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(sampleOrcamento)
    orcamentos.delete.mockResolvedValueOnce(undefined)
    const req = mockReq({ params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.delete(req as Request, res)
    expect(orcamentos.delete).toHaveBeenCalledWith({ where: { id: 'orc-1' } })
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })
})

// ── enviar ────────────────────────────────────────────────────────────────────
describe('OrcamentosController.enviar', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.enviar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 404 when not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { id: 'orc-x' } })
    const res = mockRes()
    await controller.enviar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 400 if status is not RASCUNHO', async () => {
    orcamentos.findFirst.mockResolvedValueOnce({ ...sampleOrcamento, status: 'PENDENTE' })
    const req = mockReq({ params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.enviar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('sends orcamento and returns updated data', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(sampleOrcamento)
    const sent = { ...sampleOrcamento, status: 'PENDENTE' }
    orcamentos.update.mockResolvedValueOnce(sent)
    const req = mockReq({ params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.enviar(req as Request, res)
    expect(orcamentos.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PENDENTE' }),
      }),
    )
    expect(res.json).toHaveBeenCalledWith(sent)
  })
})

// ── aprovar ───────────────────────────────────────────────────────────────────
describe('OrcamentosController.aprovar', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.aprovar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 404 when not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { id: 'orc-x' } })
    const res = mockRes()
    await controller.aprovar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 400 if status is not PENDENTE', async () => {
    orcamentos.findFirst.mockResolvedValueOnce({ ...sampleOrcamento, status: 'RASCUNHO' })
    const req = mockReq({ params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.aprovar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('approves orcamento and returns updated data', async () => {
    orcamentos.findFirst.mockResolvedValueOnce({ ...sampleOrcamento, status: 'PENDENTE' })
    const approved = { ...sampleOrcamento, status: 'APROVADO', aprovado_por: 'user-1' }
    orcamentos.update.mockResolvedValueOnce(approved)
    const req = mockReq({ params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.aprovar(req as Request, res)
    expect(orcamentos.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'APROVADO', aprovado_por: 'user-1' }),
      }),
    )
    expect(res.json).toHaveBeenCalledWith(approved)
  })
})

// ── rejeitar ──────────────────────────────────────────────────────────────────
describe('OrcamentosController.rejeitar', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { id: 'orc-1' } })
    const res = mockRes()
    await controller.rejeitar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 400 when motivo is missing', async () => {
    const req = mockReq({ params: { id: 'orc-1' }, body: {} })
    const res = mockRes()
    await controller.rejeitar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 404 when not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { id: 'orc-x' }, body: { motivo: 'Preço alto' } })
    const res = mockRes()
    await controller.rejeitar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 400 if status is not PENDENTE', async () => {
    orcamentos.findFirst.mockResolvedValueOnce({ ...sampleOrcamento, status: 'RASCUNHO' })
    const req = mockReq({ params: { id: 'orc-1' }, body: { motivo: 'Preço alto' } })
    const res = mockRes()
    await controller.rejeitar(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects orcamento and returns updated data', async () => {
    orcamentos.findFirst.mockResolvedValueOnce({ ...sampleOrcamento, status: 'PENDENTE' })
    const rejected = { ...sampleOrcamento, status: 'REJEITADO', motivo_rejeicao: 'Preço alto' }
    orcamentos.update.mockResolvedValueOnce(rejected)
    const req = mockReq({ params: { id: 'orc-1' }, body: { motivo: 'Preço alto' } })
    const res = mockRes()
    await controller.rejeitar(req as Request, res)
    expect(orcamentos.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REJEITADO', motivo_rejeicao: 'Preço alto' }),
      }),
    )
    expect(res.json).toHaveBeenCalledWith(rejected)
  })
})

// ── listItems ─────────────────────────────────────────────────────────────────
describe('OrcamentosController.listItems', () => {
  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { orcamento_id: 'orc-1' } })
    const res = mockRes()
    await controller.listItems(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns items for the orcamento', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(sampleOrcamento)
    orcamentoItens.findMany.mockResolvedValueOnce([sampleItem])
    const req = mockReq({ params: { orcamento_id: 'orc-1' } })
    const res = mockRes()
    await controller.listItems(req as Request, res)
    expect(res.json).toHaveBeenCalledWith([sampleItem])
  })

  it('returns empty array when orcamento not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { orcamento_id: 'orc-x' } })
    const res = mockRes()
    await controller.listItems(req as Request, res)
    expect(res.json).toHaveBeenCalledWith([])
  })
})

// ── addItem ───────────────────────────────────────────────────────────────────
describe('OrcamentosController.addItem', () => {
  const validItemBody = {
    descricao: 'Extração',
    ordem: 2,
    quantidade: 1,
    valor_unitario: 200,
    valor_total: 200,
  }

  it('returns 401 when no clinicId', async () => {
    const req = mockReq({ user: undefined, params: { orcamento_id: 'orc-1' } })
    const res = mockRes()
    await controller.addItem(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 400 on invalid body', async () => {
    const req = mockReq({ params: { orcamento_id: 'orc-1' }, body: { ...validItemBody, quantidade: 0 } })
    const res = mockRes()
    await controller.addItem(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 404 when orcamento not found', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(null)
    const req = mockReq({ params: { orcamento_id: 'orc-1' }, body: validItemBody })
    const res = mockRes()
    await controller.addItem(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('adds item and returns 201', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(sampleOrcamento)
    orcamentoItens.create.mockResolvedValueOnce({ ...sampleItem, id: 'item-2' })
    const req = mockReq({ params: { orcamento_id: 'orc-1' }, body: validItemBody })
    const res = mockRes()
    await controller.addItem(req as Request, res)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('returns 500 on database error', async () => {
    orcamentos.findFirst.mockResolvedValueOnce(sampleOrcamento)
    orcamentoItens.create.mockRejectedValueOnce(new Error('DB'))
    const req = mockReq({ params: { orcamento_id: 'orc-1' }, body: validItemBody })
    const res = mockRes()
    await expect(controller.addItem(req as Request, res)).rejects.toThrow('DB')
  })
})
