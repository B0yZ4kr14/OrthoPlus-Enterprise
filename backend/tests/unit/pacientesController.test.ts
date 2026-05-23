import { Request, Response } from 'express'

// ── Mocks globais ───────────────────────────────────────────────────────────

// Mock asyncHandler (se algum controller do paciente passar a usá-lo no futuro)
jest.mock('../../src/middleware/errorHandler', () => ({
  ...jest.requireActual('../../src/middleware/errorHandler'),
  asyncHandler: (fn: any) => async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next)
    } catch (err: any) {
      if (err.status && res.status) {
        res.status(err.status).json({ error: err.message })
      } else {
        next(err)
      }
    }
  },
}))

// Mock Prisma
jest.mock('../../src/infrastructure/database/prismaClient', () => ({
  prisma: {
    patients: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    patient_status_history: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    patient_accounts: {
      findFirst: jest.fn(),
    },
    patient_sessions: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    appointments: {
      findMany: jest.fn(),
    },
    pep_tratamentos: {
      findMany: jest.fn(),
    },
    budgets: {
      findMany: jest.fn(),
    },
  },
}))

// Mock logger (evita poluir stdout nos testes)
jest.mock('../../src/infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}))

// Mock EventBus
jest.mock('../../src/shared/events/EventBus', () => ({
  eventBus: {
    publish: jest.fn().mockResolvedValue(undefined),
    register: jest.fn(),
    clearHandlers: jest.fn(),
  },
}))

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}))

import { PacientesController } from '../../src/modules/pacientes/api/PacientesController'
import { PatientCommandController } from '../../src/modules/pacientes/api/commands/PatientCommandController'
import { PatientQueryController } from '../../src/modules/pacientes/api/queries/PatientQueryController'
import { prisma } from '../../src/infrastructure/database/prismaClient'
import bcrypt from 'bcrypt'

// ── Helpers ─────────────────────────────────────────────────────────────────

const mockRes = () => {
  const res: Partial<Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.clearCookie = jest.fn().mockReturnValue(res)
  return res as Response
}

const mockReq = (body = {}, headers = {}, params = {}, query = {}, user?: any): Partial<Request> => ({
  body,
  headers: headers as Request['headers'],
  params: params as Request['params'],
  query: query as Request['query'],
  user: user !== undefined ? user : { id: 'user-1', clinicId: 'clinic-1', role: 'ADMIN' },
})

// ── Stubs de dependências do controller principal ───────────────────────────

const mockPatientRepository = {
  save: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn().mockResolvedValue(null),
  findByCPF: jest.fn().mockResolvedValue(null),
  findByEmail: jest.fn().mockResolvedValue(null),
  findMany: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  countByStatus: jest.fn().mockResolvedValue({}),
  saveStatusHistory: jest.fn().mockResolvedValue(undefined),
  getStatusHistory: jest.fn().mockResolvedValue([]),
  exists: jest.fn().mockResolvedValue(false),
  delete: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  getStats: jest.fn().mockResolvedValue({ total: 0, ativos: 0, inativos: 0, arquivados: 0, novosEsteMes: 0 }),
}

const mockCadastrarUseCase = { execute: jest.fn().mockResolvedValue({ patientId: 'pid-1' }) }
const mockAtualizarUseCase = { execute: jest.fn().mockResolvedValue({ patientId: 'pid-1' }) }
const mockAlterarStatusUseCase = { execute: jest.fn().mockResolvedValue(undefined) }

// ── Suite: PacientesController ──────────────────────────────────────────────

describe('PacientesController', () => {
  let controller: PacientesController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new PacientesController(
      mockCadastrarUseCase as any,
      mockAtualizarUseCase as any,
      mockAlterarStatusUseCase as any,
      mockPatientRepository as any,
    )
  })

  // ── POST /api/pacientes ─────────────────────────────────────────────────
  describe('create', () => {
    it('returns 201 on successful creation', async () => {
      const req = mockReq({ fullName: 'João Silva', cpf: '529.982.247-25' })
      const res = mockRes()
      await controller.create(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('returns 400 when use-case throws (duplicate CPF)', async () => {
      mockCadastrarUseCase.execute.mockRejectedValueOnce(new Error('Já existe paciente cadastrado com este CPF'))
      const req = mockReq({ fullName: 'João Silva', cpf: '529.982.247-25' })
      const res = mockRes()
      await controller.create(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
    })
  })

  // ── PUT /api/pacientes/:id ──────────────────────────────────────────────
  describe('update', () => {
    it('returns 200 on successful update', async () => {
      const req = mockReq({ fullName: 'João S.' }, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.update(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('returns 400 when use-case throws', async () => {
      mockAtualizarUseCase.execute.mockRejectedValueOnce(new Error('Paciente não encontrado'))
      const req = mockReq({ fullName: 'João S.' }, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.update(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  // ── GET /api/pacientes ──────────────────────────────────────────────────
  describe('list', () => {
    it('returns paginated list', async () => {
      mockPatientRepository.findMany.mockResolvedValueOnce({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      })
      const req = mockReq({}, {}, {}, {})
      const res = mockRes()
      await controller.list(req as Request, res)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('returns 500 on repository error', async () => {
      mockPatientRepository.findMany.mockRejectedValueOnce(new Error('DB error'))
      const req = mockReq({}, {}, {}, {})
      const res = mockRes()
      await controller.list(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  // ── GET /api/pacientes/:id ──────────────────────────────────────────────
  describe('getById', () => {
    it('returns patient when found', async () => {
      mockPatientRepository.findById.mockResolvedValueOnce({
        id: 'pid-1',
        fullName: 'João Silva',
        clinicId: 'clinic-1',
        statusCode: 'PROSPECT',
        isActive: true,
        createdAt: new Date(),
      } as any)
      const req = mockReq({}, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.getById(req as Request, res)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('returns 404 when not found', async () => {
      mockPatientRepository.findById.mockResolvedValueOnce(null)
      const req = mockReq({}, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.getById(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  // ── PATCH /api/pacientes/:id/status ─────────────────────────────────────
  describe('changeStatus', () => {
    it('returns 200 on success', async () => {
      const req = mockReq({ novoStatusCode: 'TRATAMENTO' }, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.changeStatus(req as Request, res)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
    })

    it('returns 400 when novoStatusCode is missing', async () => {
      const req = mockReq({}, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.changeStatus(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  // ── GET /api/pacientes/stats/by-status ──────────────────────────────────
  describe('statsByStatus', () => {
    it('returns counts', async () => {
      mockPatientRepository.countByStatus.mockResolvedValueOnce({ PROSPECT: 5, TRATAMENTO: 2 })
      const req = mockReq()
      const res = mockRes()
      await controller.statsByStatus(req as Request, res)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { PROSPECT: 5, TRATAMENTO: 2 } }))
    })
  })

  // ── GET /api/pacientes/:id/timeline ─────────────────────────────────────
  describe('getPatientTimeline', () => {
    it('returns timeline array', async () => {
      ;(prisma.appointments.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.pep_tratamentos.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.budgets.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.patient_status_history.findMany as jest.Mock).mockResolvedValue([])
      const req = mockReq({}, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.getPatientTimeline(req as Request, res)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ timeline: [] }))
    })

    it('returns 401 when clinicId missing', async () => {
      const req = mockReq({}, {}, { id: 'pid-1' }, {}, null) // sem user
      const res = mockRes()
      await controller.getPatientTimeline(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })

  // ── POST /api/pacientes/auth (login) ────────────────────────────────────
  describe('patientAuth', () => {
    it('returns 200 and sets cookie on valid login', async () => {
      ;(prisma.patient_accounts.findFirst as jest.Mock).mockResolvedValueOnce({
        patient_id: 'pid-1',
        email: 'joao@email.com',
        senha_hash: '$2b$10$hash',
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(prisma.patient_sessions.create as jest.Mock).mockResolvedValueOnce({})
      const req = mockReq({ action: 'login', email: 'joao@email.com', password: '123456' })
      const res = mockRes()
      await controller.patientAuth(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.cookie).toHaveBeenCalledWith(
        'patient_session',
        expect.any(String),
        expect.objectContaining({ httpOnly: true }),
      )
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        patient: expect.any(Object),
      }))
    })

    it('returns 401 when account not found', async () => {
      ;(prisma.patient_accounts.findFirst as jest.Mock).mockResolvedValueOnce(null)
      const req = mockReq({ action: 'login', email: 'x@x.com', password: '123' })
      const res = mockRes()
      await controller.patientAuth(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('returns 200 on logout', async () => {
      ;(prisma.patient_sessions.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 1 })
      const req = mockReq({ action: 'logout' }, { 'x-session-id': 'sess-1' })
      const res = mockRes()
      await controller.patientAuth(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('returns 400 on invalid action', async () => {
      const req = mockReq({ action: 'invalid' })
      const res = mockRes()
      await controller.patientAuth(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })
  })

  // ── DELETE /api/pacientes/:id ───────────────────────────────────────────
  describe('delete', () => {
    it('returns 200 on soft delete', async () => {
      ;(prisma.patients.deleteMany as jest.Mock).mockResolvedValueOnce({ count: 1 })
      const req = mockReq({}, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.delete(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('returns 401 when clinicId missing', async () => {
      const req = mockReq({}, {}, { id: 'pid-1' }, {}, null)
      const res = mockRes()
      await controller.delete(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })
})

// ── Suite: PatientCommandController ─────────────────────────────────────────

describe('PatientCommandController', () => {
  const mockCreateCmd = { execute: jest.fn() }
  const mockUpdateCmd = { execute: jest.fn() }
  const mockStatusCmd = { execute: jest.fn() }

  let controller: PatientCommandController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new PatientCommandController(
      mockCreateCmd as any,
      mockUpdateCmd as any,
      mockStatusCmd as any,
    )
  })

  describe('create', () => {
    it('returns 201 with created patient', async () => {
      mockCreateCmd.execute.mockResolvedValueOnce({ id: 'pid-1' })
      const req = mockReq({ fullName: 'João' })
      const res = mockRes()
      await controller.create(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ id: 'pid-1' })
    })

    it('returns 500 on error', async () => {
      mockCreateCmd.execute.mockRejectedValueOnce(new Error('fail'))
      const req = mockReq({ fullName: 'João' })
      const res = mockRes()
      await controller.create(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('update', () => {
    it('returns 200 with updated patient', async () => {
      mockUpdateCmd.execute.mockResolvedValueOnce({ id: 'pid-1' })
      const req = mockReq({ fullName: 'João S.' }, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.update(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('changeStatus', () => {
    it('returns 200 on success', async () => {
      mockStatusCmd.execute.mockResolvedValueOnce({ id: 'pid-1' })
      const req = mockReq({ statusCode: 'TRATAMENTO' }, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.changeStatus(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})

// ── Suite: PatientQueryController ───────────────────────────────────────────

describe('PatientQueryController', () => {
  const mockGetQuery = { execute: jest.fn() }
  const mockListQuery = { execute: jest.fn() }
  const mockStatsQuery = { execute: jest.fn() }

  let controller: PatientQueryController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new PatientQueryController(
      mockGetQuery as any,
      mockListQuery as any,
      mockStatsQuery as any,
    )
  })

  describe('getById', () => {
    it('returns 200 when patient found', async () => {
      mockGetQuery.execute.mockResolvedValueOnce({ id: 'pid-1', fullName: 'João' })
      const req = mockReq({}, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.getById(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('returns 404 when patient not found', async () => {
      mockGetQuery.execute.mockResolvedValueOnce(null)
      const req = mockReq({}, {}, { id: 'pid-1' })
      const res = mockRes()
      await controller.getById(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('list', () => {
    it('returns 200 with paginated results', async () => {
      mockListQuery.execute.mockResolvedValueOnce({ items: [], total: 0, page: 1, totalPages: 0 })
      const req = mockReq({}, {}, {}, { page: '1', limit: '20' })
      const res = mockRes()
      await controller.list(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('getStats', () => {
    it('returns 200 with stats', async () => {
      mockStatsQuery.execute.mockResolvedValueOnce({ total: 10, ativos: 5, inativos: 5, arquivados: 0, novosEsteMes: 2 })
      const req = mockReq()
      const res = mockRes()
      await controller.getStats(req as Request, res)
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
