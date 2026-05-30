import {
  LocalAIService,
  AIModelConfig,
} from "../../src/modules/ia_radiografia/domain/services/LocalAIService";
import { IAEncryptionService } from "../../src/modules/ia_radiografia/domain/services/IAEncryptionService";
import { IAConsentimentoService } from "../../src/modules/ia_radiografia/domain/services/IAConsentimentoService";
import { IIARadiografiaRepository } from "../../src/modules/ia_radiografia/domain/repositories/IIARadiografiaRepository";
import { TipoConsentimentoIA } from "@prisma/client";

// Mock global fetch for LocalAIService
global.fetch = jest.fn();

describe("LocalAIService", () => {
  let service: LocalAIService;

  beforeEach(() => {
    service = new LocalAIService();
    jest.clearAllMocks();
  });

  describe("analyzeRadiografia", () => {
    it("should return analysis result with confidence score", async () => {
      const mockResponse = {
        response: JSON.stringify({
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              dente_codigo: "11",
              localizacao: "oclusal",
              severidade: "MODERADA",
              confianca: 85,
              descricao: "Cárie detectada",
              sugestao_tratamento: "Restauração",
              urgente: false,
            },
          ],
          sugestoes_tratamento: [
            {
              tratamento: "Restauração",
              descricao: "Remover cárie e restaurar",
              prioridade: "ALTA",
            },
          ],
          observacoes_ia: "Radiografia de boa qualidade",
          dentes_avaliados: [11, 12, 13],
          qualidade_imagem: "boa",
          requer_avaliacao_especialista: false,
        }),
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const imageBuffer = Buffer.from("fake-image-data");
      const result = await service.analyzeRadiografia(
        imageBuffer,
        "PERIAPICAL",
      );

      expect(result.resultado.problemas_detectados).toHaveLength(1);
      expect(result.resultado.problemas_detectados[0].tipo_problema).toBe(
        "CARIE",
      );
      expect(result.confidence).toBeGreaterThanOrEqual(0.79);
      expect(result.modelUsed).toBe("llava");
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("should throw error when AI endpoint returns non-OK status", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const imageBuffer = Buffer.from("fake-image-data");

      await expect(
        service.analyzeRadiografia(imageBuffer, "PANORAMICA"),
      ).rejects.toThrow("Local AI error: 500 Internal Server Error");
    });

    it("should use fallback parser when JSON parsing fails", async () => {
      const mockResponse = {
        response: "not-valid-json",
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const imageBuffer = Buffer.from("fake-image-data");
      const result = await service.analyzeRadiografia(imageBuffer, "BITE_WING");

      expect(result.resultado.problemas_detectados).toHaveLength(0);
      expect(result.resultado.qualidade_imagem).toBe("regular");
      expect(result.resultado.requer_avaliacao_especialista).toBe(true);
    });

    it("should use custom model config when provided", async () => {
      const mockResponse = {
        response: JSON.stringify({
          problemas_detectados: [],
          sugestoes_tratamento: [],
          observacoes_ia: "OK",
          dentes_avaliados: [],
          qualidade_imagem: "excelente",
          requer_avaliacao_especialista: true,
        }),
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const config: AIModelConfig = {
        endpoint: "http://custom-ai:11434",
        model: "custom-model",
        version: "v2",
      };

      const imageBuffer = Buffer.from("fake-image-data");
      const result = await service.analyzeRadiografia(
        imageBuffer,
        "PANORAMICA",
        config,
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://custom-ai:11434/api/generate",
        expect.any(Object),
      );
      expect(result.modelUsed).toBe("custom-model");
      expect(result.modelVersion).toBe("v2");
    });

    it("should calculate confidence based on result quality", async () => {
      const mockResponse = {
        response: JSON.stringify({
          problemas_detectados: [
            {
              tipo_problema: "CARIE",
              severidade: "LEVE",
              confianca: 70,
              urgente: false,
            },
          ],
          sugestoes_tratamento: [],
          observacoes_ia: "A".repeat(100),
          dentes_avaliados: [11, 12, 13, 14, 15],
          qualidade_imagem: "excelente",
          requer_avaliacao_especialista: true,
        }),
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const imageBuffer = Buffer.from("fake-image-data");
      const result = await service.analyzeRadiografia(imageBuffer, "OCLUSAL");

      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.confidence).toBeLessThanOrEqual(0.99);
    });
  });
});

describe("IAEncryptionService", () => {
  // Override env var for tests
  const originalEnv = process.env.IA_ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.IA_ENCRYPTION_KEY = "test-key-32-characters-long!!!!!";
  });

  afterAll(() => {
    process.env.IA_ENCRYPTION_KEY = originalEnv;
  });

  let service: IAEncryptionService;

  beforeEach(() => {
    service = new IAEncryptionService();
  });

  it("should encrypt and decrypt data correctly", () => {
    const data = { resultados: [{ tipo: "CARIE", confianca: 90 }] };
    const analiseId = "analise-123";

    const encrypted = service.encrypt(data, analiseId);
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.tag).toBeDefined();

    const decrypted = service.decrypt(encrypted, analiseId);
    expect(decrypted).toEqual(data);
  });

  it("should produce different ciphertexts for same data with different IDs", () => {
    const data = { value: "sensitive" };

    const encrypted1 = service.encrypt(data, "id-1");
    const encrypted2 = service.encrypt(data, "id-2");

    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
  });

  it("should throw when decrypting tampered ciphertext", () => {
    const data = { value: "test" };
    const analiseId = "analise-tamper";

    const encrypted = service.encrypt(data, analiseId);
    encrypted.ciphertext = encrypted.ciphertext.slice(0, -4) + "XXXX";

    expect(() => service.decrypt(encrypted, analiseId)).toThrow();
  });
});

describe("IAConsentimentoService", () => {
  let service: IAConsentimentoService;
  let mockRepo: jest.Mocked<IIARadiografiaRepository>;

  beforeEach(() => {
    mockRepo = {
      findConsentimento: jest.fn(),
      createConsentimento: jest.fn().mockResolvedValue({ id: "cons-1" }),
      findConsentimentoToRevoke: jest.fn(),
      updateConsentimento: jest
        .fn()
        .mockResolvedValue({ id: "cons-1", revogado: true }),
      findHistoricoConsentimento: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<IIARadiografiaRepository>;

    service = new IAConsentimentoService(mockRepo);
  });

  describe("verificarConsentimento", () => {
    it("should return true when consentimento exists", async () => {
      mockRepo.findConsentimento.mockResolvedValue({
        id: "cons-1",
        consentido: true,
      } as any);

      const result = await service.verificarConsentimento(
        "paciente-1",
        "clinica-1",
      );

      expect(result).toBe(true);
      expect(mockRepo.findConsentimento).toHaveBeenCalledWith(
        "paciente-1",
        "clinica-1",
      );
    });

    it("should return false when consentimento does not exist", async () => {
      mockRepo.findConsentimento.mockResolvedValue(null);

      const result = await service.verificarConsentimento(
        "paciente-1",
        "clinica-1",
      );

      expect(result).toBe(false);
    });
  });

  describe("registrarConsentimento", () => {
    it("should create consentimento with IA_RADIOGRAFIA type", async () => {
      const dto = {
        pacienteId: "paciente-1",
        clinicId: "clinica-1",
        consentido: true,
        ipAddress: "192.168.1.1",
        hashTermo: "abc123",
      };

      await service.registrarConsentimento(dto);

      expect(mockRepo.createConsentimento).toHaveBeenCalledWith(
        expect.objectContaining({
          paciente_id: "paciente-1",
          clinic_id: "clinica-1",
          tipo_consentimento: TipoConsentimentoIA.IA_RADIOGRAFIA,
          consentido: true,
          ip_consentimento: "192.168.1.1",
          hash_termo: "abc123",
        }),
      );
    });
  });

  describe("revogarConsentimento", () => {
    it("should revoke existing consentimento", async () => {
      mockRepo.findConsentimentoToRevoke.mockResolvedValue({
        id: "cons-1",
      } as any);

      await service.revogarConsentimento({
        pacienteId: "paciente-1",
        clinicId: "clinica-1",
        motivo: "Paciente solicitou revogação",
      });

      expect(mockRepo.updateConsentimento).toHaveBeenCalledWith("cons-1", {
        revogado: true,
        data_revogacao: expect.any(Date),
        motivo_revogacao: "Paciente solicitou revogação",
      });
    });

    it("should throw when consentimento not found", async () => {
      mockRepo.findConsentimentoToRevoke.mockResolvedValue(null);

      await expect(
        service.revogarConsentimento({
          pacienteId: "paciente-1",
          clinicId: "clinica-1",
          motivo: "test",
        }),
      ).rejects.toThrow("Consentimento nao encontrado");
    });
  });

  describe("obterHistoricoConsentimento", () => {
    it("should return historico from repository", async () => {
      const historico = [{ id: "cons-1" }, { id: "cons-2" }];
      mockRepo.findHistoricoConsentimento.mockResolvedValue(historico as any);

      const result = await service.obterHistoricoConsentimento(
        "paciente-1",
        "clinica-1",
      );

      expect(result).toEqual(historico);
      expect(mockRepo.findHistoricoConsentimento).toHaveBeenCalledWith(
        "paciente-1",
        "clinica-1",
      );
    });
  });
});
