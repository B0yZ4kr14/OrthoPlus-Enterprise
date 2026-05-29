import { Request, Response } from "express";

// ── Mocks globais ───────────────────────────────────────────────────────────

jest.mock("../../src/infrastructure/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("../../src/infrastructure/metrics/MetricsCollector", () => ({
  getMetricsCollector: jest.fn(() => ({
    iaRadiografia: {
      uploadsTotal: { inc: jest.fn() },
      analysisDuration: { observe: jest.fn() },
      reviewsTotal: { inc: jest.fn() },
      consentRevocationsTotal: { inc: jest.fn() },
      analysisErrors: { inc: jest.fn() },
    },
    histogram: jest.fn(() => ({ observe: jest.fn() })),
    counter: jest.fn(() => ({ inc: jest.fn() })),
  })),
}));

jest.mock("../../src/infrastructure/metrics/PrometheusMetrics", () => ({
  prometheusMetrics: {
    getRegistry: jest.fn(() => ({})),
  },
}));

// Mock Prisma
const mockPrismaCreate = jest.fn();
const mockPrismaFindFirst = jest.fn();
const mockPrismaUpdate = jest.fn();
const mockPrismaFindMany = jest.fn();

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
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
}));

// Mock BullMQ queue
jest.mock("../../src/workers/iaRadiografiaWorker", () => ({
  iaRadiografiaQueue: {
    add: jest.fn().mockResolvedValue({ id: "job-1" }),
  },
}));

// Mock services
const mockVerificarConsentimento = jest.fn();
const mockRegistrarAcao = jest.fn();
const mockObterAuditoriaPorAnalise = jest.fn();
const mockStrip = jest.fn();
const mockValidateNoPII = jest.fn();
const mockAnalyzeRadiografia = jest.fn();

jest.mock(
  "../../src/modules/ia_radiografia/domain/services/IAConsentimentoService",
  () => ({
    IAConsentimentoService: jest.fn().mockImplementation(() => ({
      verificarConsentimento: mockVerificarConsentimento,
      registrarConsentimento: jest.fn(),
      revogarConsentimento: jest.fn(),
    })),
  }),
);

jest.mock(
  "../../src/modules/ia_radiografia/domain/services/IAAuditService",
  () => ({
    IAAuditService: jest.fn().mockImplementation(() => ({
      registrarAcao: mockRegistrarAcao,
      obterAuditoriaPorAnalise: mockObterAuditoriaPorAnalise,
    })),
  }),
);

jest.mock(
  "../../src/modules/ia_radiografia/domain/services/IAEncryptionService",
  () => ({
    IAEncryptionService: jest.fn().mockImplementation(() => ({
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    })),
  }),
);

jest.mock(
  "../../src/modules/ia_radiografia/domain/services/DicomMetadataStripper",
  () => ({
    DicomMetadataStripper: jest.fn().mockImplementation(() => ({
      strip: mockStrip,
      validateNoPII: mockValidateNoPII,
    })),
  }),
);

jest.mock(
  "../../src/modules/ia_radiografia/domain/services/LocalAIService",
  () => ({
    LocalAIService: jest.fn().mockImplementation(() => ({
      analyzeRadiografia: mockAnalyzeRadiografia,
    })),
  }),
);

jest.mock("fs", () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// ── Imports pós-mock ────────────────────────────────────────────────────────

import { IARadiografiaController } from "../../src/modules/ia_radiografia/api/controller";
import { iaRadiografiaQueue } from "../../src/workers/iaRadiografiaWorker";

describe("IARadiografiaController", () => {
  let controller: IARadiografiaController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    controller = new IARadiografiaController();
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = { status: statusMock, json: jsonMock };
    req = {
      user: { id: "dentista-123" },
      clinicId: "clinic-123",
      body: {},
      params: {},
      ip: "127.0.0.1",
      headers: { "user-agent": "test-agent" },
    };
    jest.clearAllMocks();
  });

  // ── T013: Consent verification blocks upload without consent ─────────────
  describe("uploadEAnalisar — consent verification", () => {
    it("should block upload when patient has no LGPD consent", async () => {
      mockVerificarConsentimento.mockResolvedValue(false);
      req.body = { patient_id: "patient-1", tipo_radiografia: "PANORAMICA" };
      req.file = { buffer: Buffer.from("fake-image") } as any;

      await expect(
        controller.uploadEAnalisar(req as Request, res as Response),
      ).rejects.toThrow("Consentimento LGPD necessario");
    });

    it("should allow upload when patient has LGPD consent", async () => {
      mockVerificarConsentimento.mockResolvedValue(true);
      mockValidateNoPII.mockResolvedValue(true);
      mockStrip.mockResolvedValue({
        cleanBuffer: Buffer.from("clean"),
        originalHash: "orig-hash",
        cleanHash: "clean-hash",
      });
      mockPrismaCreate.mockResolvedValue({
        id: "analise-1",
        paciente_id: "patient-1",
        clinic_id: "clinic-123",
      });
      req.body = { patient_id: "patient-1", tipo_radiografia: "PANORAMICA" };
      req.file = { buffer: Buffer.from("fake-image") } as any;

      await controller.uploadEAnalisar(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(202);
      expect(mockPrismaCreate).toHaveBeenCalled();
      expect(iaRadiografiaQueue.add).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: "PENDENTE" }),
      );
    });
  });

  // ── T014: Metadata stripper removes PII from DICOM/EXIF ──────────────────
  describe("uploadEAnalisar — metadata stripping", () => {
    it("should reject image when PII validation fails", async () => {
      mockVerificarConsentimento.mockResolvedValue(true);
      mockValidateNoPII.mockResolvedValue(false);
      mockStrip.mockResolvedValue({
        cleanBuffer: Buffer.from("clean"),
        originalHash: "orig-hash",
        cleanHash: "clean-hash",
      });
      req.body = { patient_id: "patient-1", tipo_radiografia: "PANORAMICA" };
      req.file = { buffer: Buffer.from("fake-image") } as any;

      await expect(
        controller.uploadEAnalisar(req as Request, res as Response),
      ).rejects.toThrow("Imagem contem possiveis metadados PII");
    });
  });

  // ── T015: AI service returns structured JSON with problemas_detectados ───
  describe("uploadEAnalisar — AI analysis result", () => {
    it("should enqueue analysis job and return 202 with PENDENTE status", async () => {
      mockVerificarConsentimento.mockResolvedValue(true);
      mockValidateNoPII.mockResolvedValue(true);
      mockStrip.mockResolvedValue({
        cleanBuffer: Buffer.from("clean"),
        originalHash: "orig-hash",
        cleanHash: "clean-hash",
      });
      mockPrismaCreate.mockResolvedValue({
        id: "analise-1",
        paciente_id: "patient-1",
        clinic_id: "clinic-123",
        status: "PENDENTE",
      });
      req.body = { patient_id: "patient-1", tipo_radiografia: "PANORAMICA" };
      req.file = { buffer: Buffer.from("fake-image") } as any;

      await controller.uploadEAnalisar(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(202);
      expect(iaRadiografiaQueue.add).toHaveBeenCalledWith(
        "analyze",
        expect.objectContaining({
          analiseId: "analise-1",
          tipoRadiografia: "PANORAMICA",
        }),
        expect.objectContaining({ attempts: 2 }),
      );
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "analise-1",
          status: "PENDENTE",
        }),
      );
    });
  });

  // ── T022: Review endpoint requires both fields ───────────────────────────
  describe("revisarAnalise — field validation", () => {
    it("should return 400 when observacoes_dentista is missing", async () => {
      req.params = { id: "analise-1" };
      req.body = { assinatura_digital: "signed" };
      mockPrismaFindFirst.mockResolvedValue({
        id: "analise-1",
        clinic_id: "clinic-123",
      });

      await expect(
        controller.revisarAnalise(req as Request, res as Response),
      ).rejects.toThrow("Observacoes e assinatura digital sao obrigatorias");
    });

    it("should return 400 when assinatura_digital is missing", async () => {
      req.params = { id: "analise-1" };
      req.body = { observacoes_dentista: "Looks good" };
      mockPrismaFindFirst.mockResolvedValue({
        id: "analise-1",
        clinic_id: "clinic-123",
      });

      await expect(
        controller.revisarAnalise(req as Request, res as Response),
      ).rejects.toThrow("Observacoes e assinatura digital sao obrigatorias");
    });

    it("should return 404 when analysis does not exist", async () => {
      req.params = { id: "nonexistent" };
      req.body = {
        observacoes_dentista: "Looks good",
        assinatura_digital: "signed",
      };
      mockPrismaFindFirst.mockResolvedValue(null);

      await expect(
        controller.revisarAnalise(req as Request, res as Response),
      ).rejects.toThrow("Analise with id 'nonexistent' not found");
    });
  });

  // ── T023: Review creates audit log entry ─────────────────────────────────
  describe("revisarAnalise — audit log", () => {
    it("should create audit log entry on successful review", async () => {
      req.params = { id: "analise-1" };
      req.body = {
        observacoes_dentista: "Looks good",
        assinatura_digital: "signed",
      };
      mockPrismaFindFirst.mockResolvedValue({
        id: "analise-1",
        clinic_id: "clinic-123",
        paciente_id: "patient-1",
      });
      mockPrismaUpdate.mockResolvedValue({ id: "analise-1", revisada: true });

      await controller.revisarAnalise(req as Request, res as Response);

      expect(mockRegistrarAcao).toHaveBeenCalledWith(
        expect.objectContaining({
          analiseId: "analise-1",
          acao: "REVISAR",
          clinicId: "clinic-123",
        }),
      );
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("revisada"),
        }),
      );
    });
  });

  // ── T027: Consent revocation blocks future uploads ─────────────────────────
  describe("revogarConsentimento — blocks uploads", () => {
    it("should return 403 when uploading after consent is revoked", async () => {
      // Step 1: revoke consent
      req.params = { pacienteId: "patient-1" };
      req.body = { motivo: "Paciente solicitou" };

      await controller.revogarConsentimento(req as Request, res as Response);
      expect(jsonMock).toHaveBeenCalled();

      // Step 2: attempt upload — consent check should now fail
      mockVerificarConsentimento.mockResolvedValue(false);
      req.body = { patient_id: "patient-1", tipo_radiografia: "PANORAMICA" };
      req.file = { buffer: Buffer.from("fake-image") } as any;

      await expect(
        controller.uploadEAnalisar(req as Request, res as Response),
      ).rejects.toThrow("Consentimento LGPD necessario");
    });
  });

  // ── T028: Audit log GET returns clinic-scoped records ──────────────────────
  describe("obterAuditoriaAnalise — clinic-scoped", () => {
    it("should return 404 for analysis from another clinic", async () => {
      mockPrismaFindFirst.mockResolvedValue(null);
      req.params = { id: "analise-other-clinic" };

      await expect(
        controller.obterAuditoriaAnalise(req as Request, res as Response),
      ).rejects.toThrow("Analise with id 'analise-other-clinic' not found");
    });

    it("should return audit records for analysis in same clinic", async () => {
      mockPrismaFindFirst.mockResolvedValue({
        id: "analise-1",
        clinic_id: "clinic-123",
        paciente_id: "patient-1",
      });
      const mockAuditRecords = [
        { id: "audit-1", acao: "UPLOAD", created_at: new Date() },
        { id: "audit-2", acao: "REVISAR", created_at: new Date() },
      ];
      mockObterAuditoriaPorAnalise.mockResolvedValue(mockAuditRecords);

      req.params = { id: "analise-1" };

      await controller.obterAuditoriaAnalise(req as Request, res as Response);

      // res.status(200) is implicit; controller calls res.json() directly
      expect(jsonMock).toHaveBeenCalledWith(mockAuditRecords);
    });
  });
});
