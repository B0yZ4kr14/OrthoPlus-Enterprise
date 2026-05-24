import { Request, Response } from 'express'

// ── Mocks globais ───────────────────────────────────────────────────────────

jest.mock('../../src/infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}))

jest.mock('../../src/infrastructure/metrics/MetricsCollector', () => ({
  getMetricsCollector: jest.fn(() => ({
    iaRadiografia: {
      uploadsTotal: { inc: jest.fn() },
      analysisDuration: { observe: jest.fn() },
      reviewsTotal: { inc: jest.fn() },
    },
    histogram: jest.fn(() => ({ observe: jest.fn() })),
    counter: jest.fn(() => ({ inc: jest.fn() })),
  })),
}))

jest.mock('../../src/infrastructure/metrics/PrometheusMetrics', () => ({
  prometheusMetrics: {
    getRegistry: jest.fn(() => ({})),
  },
}))

// Mock Prisma
const mockPrismaCreate = jest.fn()
const mockPrismaFindFirst = jest.fn()
const mockPrismaUpdate = jest.fn()
const mockPrismaFindMany = jest.fn()

jest.mock('../../src/infrastructure/database/prismaClient', () => ({
  prisma: {
    ia_radiografia_analise: {
      create: mockPrismaCreate,
      findFirst: mockPrismaFindFirst,
      update: mockPrismaUpdate,
      findMany: mockPrismaFindMany,
    },
    ia_radiografia_consentimento: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    ia_radiografia_audit_log: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock services
const mockVerificarConsentimento = jest.fn()
const mockRegistrarAcao = jest.fn()
const mockStrip = jest.fn()
const mockValidateNoPII = jest.fn()
const mockAnalyzeRadiografia = jest.fn()

jest.mock('../../src/modules/ia_radiografia/domain/services/IAConsentimentoService', () => ({
  IAConsentimentoService: jest.fn().mockImplementation(() => ({
    verificarConsentimento: mockVerificarConsentimento,
    registrarConsentimento: jest.fn(),
    revogarConsentimento: jest.fn(),
  })),
}))

jest.mock('../../src/modules/ia_radiografia/domain/services/IAAuditService', () => ({
  IAAuditService: jest.fn().mockImplementation(() => ({
    registrarAcao: mockRegistrarAcao,
    obterAuditoriaPorAnalise: jest.fn(),
  })),
}))

jest.mock('../../src/modules/ia_radiografia/domain/services/IAEncryptionService', () => ({
  IAEncryptionService: jest.fn().mockImplementation(() => ({
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  })),
}))

jest.mock('../../src/modules/ia_radiografia/domain/services/DicomMetadataStripper', () => ({
  DicomMetadataStripper: jest.fn().mockImplementation(() => ({
    strip: mockStrip,
    validateNoPII: mockValidateNoPII,
  })),
}))

jest.mock('../../src/modules/ia_radiografia/domain/services/LocalAIService', () => ({
  LocalAIService: jest.fn().mockImplementation(() => ({
    analyzeRadiografia: mockAnalyzeRadiografia,
  })),
}))

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}))

// ── Imports pós-mock ────────────────────────────────────────────────────────

import { IARadiografiaController } from '../../src/modules/ia_radiografia/api/controller'

describe('IARadiografiaController', () => {
  let controller: IARadiografiaController
  let req: Partial<Request>
  let res: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    controller = new IARadiografiaController()
    jsonMock = jest.fn()
    statusMock = jest.fn(() => ({ json: jsonMock }))
    res = { status: statusMock, json: jsonMock }
    req = {
      user: { id: 'dentista-123' },
      clinicId: 'clinic-123',
      body: {},
      params: {},
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' },
    }
    jest.clearAllMocks()
  })

  // ── T013: Consent verification blocks upload without consent ─────────────
  describe('uploadEAnalisar — consent verification', () => {
    it('should block upload when patient has no LGPD consent', async () => {
      mockVerificarConsentimento.mockResolvedValue(false)
      req.body = { patient_id: 'patient-1', tipo_radiografia: 'PANORAMICA' }
      req.file = { buffer: Buffer.from('fake-image') } as any

      await controller.uploadEAnalisar(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(403)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'CONSENTIMENTO_AUSENTE' })
      )
    })

    it('should allow upload when patient has LGPD consent', async () => {
      mockVerificarConsentimento.mockResolvedValue(true)
      mockValidateNoPII.mockResolvedValue(true)
      mockStrip.mockResolvedValue({
        cleanBuffer: Buffer.from('clean'),
        originalHash: 'orig-hash',
        cleanHash: 'clean-hash',
      })
      mockAnalyzeRadiografia.mockResolvedValue({
        resultado: { problemas_detectados: [], confianca: 0.9 },
        confidence: 0.9,
        processingTimeMs: 1200,
      })
      mockPrismaCreate.mockResolvedValue({
        id: 'analise-1',
        paciente_id: 'patient-1',
        clinic_id: 'clinic-123',
      })
      req.body = { patient_id: 'patient-1', tipo_radiografia: 'PANORAMICA' }
      req.file = { buffer: Buffer.from('fake-image') } as any

      await controller.uploadEAnalisar(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(mockPrismaCreate).toHaveBeenCalled()
    })
  })

  // ── T014: Metadata stripper removes PII from DICOM/EXIF ──────────────────
  describe('uploadEAnalisar — metadata stripping', () => {
    it('should reject image when PII validation fails', async () => {
      mockVerificarConsentimento.mockResolvedValue(true)
      mockValidateNoPII.mockResolvedValue(false)
      mockStrip.mockResolvedValue({
        cleanBuffer: Buffer.from('clean'),
        originalHash: 'orig-hash',
        cleanHash: 'clean-hash',
      })
      req.body = { patient_id: 'patient-1', tipo_radiografia: 'PANORAMICA' }
      req.file = { buffer: Buffer.from('fake-image') } as any

      await controller.uploadEAnalisar(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('PII') })
      )
    })
  })

  // ── T015: AI service returns structured JSON with problemas_detectados ───
  describe('uploadEAnalisar — AI analysis result', () => {
    it('should return structured analysis with problemas_detectados', async () => {
      mockVerificarConsentimento.mockResolvedValue(true)
      mockValidateNoPII.mockResolvedValue(true)
      mockStrip.mockResolvedValue({
        cleanBuffer: Buffer.from('clean'),
        originalHash: 'orig-hash',
        cleanHash: 'clean-hash',
      })
      const aiResult = {
        resultado: {
          problemas_detectados: [
            { tipo: 'CÁRIE', regiao: 'molar-superior-esq', confianca: 0.92 },
          ],
          confianca: 0.88,
        },
        confidence: 0.88,
        processingTimeMs: 1200,
      }
      mockAnalyzeRadiografia.mockResolvedValue(aiResult)
      mockPrismaCreate.mockResolvedValue({
        id: 'analise-1',
        paciente_id: 'patient-1',
        clinic_id: 'clinic-123',
        status: 'PENDENTE',
      })
      req.body = { patient_id: 'patient-1', tipo_radiografia: 'PANORAMICA' }
      req.file = { buffer: Buffer.from('fake-image') } as any

      await controller.uploadEAnalisar(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'analise-1',
          status: 'PENDENTE',
        })
      )
    })
  })

  // ── T022: Review endpoint requires both fields ───────────────────────────
  describe('revisarAnalise — field validation', () => {
    it('should return 400 when observacoes_dentista is missing', async () => {
      req.params = { id: 'analise-1' }
      req.body = { assinatura_digital: 'signed' }
      mockPrismaFindFirst.mockResolvedValue({ id: 'analise-1', clinic_id: 'clinic-123' })

      await controller.revisarAnalise(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Observacoes'),
        })
      )
    })

    it('should return 400 when assinatura_digital is missing', async () => {
      req.params = { id: 'analise-1' }
      req.body = { observacoes_dentista: 'Looks good' }
      mockPrismaFindFirst.mockResolvedValue({ id: 'analise-1', clinic_id: 'clinic-123' })

      await controller.revisarAnalise(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('assinatura'),
        })
      )
    })

    it('should return 404 when analysis does not exist', async () => {
      req.params = { id: 'nonexistent' }
      req.body = { observacoes_dentista: 'Looks good', assinatura_digital: 'signed' }
      mockPrismaFindFirst.mockResolvedValue(null)

      await controller.revisarAnalise(req as Request, res as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
    })
  })

  // ── T023: Review creates audit log entry ─────────────────────────────────
  describe('revisarAnalise — audit log', () => {
    it('should create audit log entry on successful review', async () => {
      req.params = { id: 'analise-1' }
      req.body = { observacoes_dentista: 'Looks good', assinatura_digital: 'signed' }
      mockPrismaFindFirst.mockResolvedValue({
        id: 'analise-1',
        clinic_id: 'clinic-123',
        paciente_id: 'patient-1',
      })
      mockPrismaUpdate.mockResolvedValue({ id: 'analise-1', revisada: true })

      await controller.revisarAnalise(req as Request, res as Response)

      expect(mockRegistrarAcao).toHaveBeenCalledWith(
        expect.objectContaining({
          analiseId: 'analise-1',
          acao: 'REVISAR',
          clinicId: 'clinic-123',
        })
      )
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('revisada') })
      )
    })
  })
})
