import { FilesService } from "@/modules/files/application/services/FilesService";

// Mock the Prisma client so tests run without a real database
jest.mock("../../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    arquivo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
    arquivo_ocr: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    arquivo_versao: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
  VisibilidadeArquivo: {
    PUBLICO: "PUBLICO",
    RESTRITO: "RESTRITO",
    CONFIDENCIAL: "CONFIDENCIAL",
  },
}));

import { prisma } from "@/infrastructure/database/prismaClient";

describe("FilesService", () => {
  const service = new FilesService();
  const testClinicId = "clinic-test-001";
  const testUserId = "user-test-001";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a file record with metadata", async () => {
      const mockRecord = {
        id: "file-id-001",
        nome_original: "documento.pdf",
        nome_storage: "file-1234567890-documento.pdf",
        mime_type: "application/pdf",
        tamanho_bytes: 1024,
        categoria: "CONTRATO",
        visibilidade: "RESTRITO",
        created_at: new Date(),
      };

      (prisma.arquivo.create as jest.Mock).mockResolvedValue(mockRecord);

      const input = {
        clinicId: testClinicId,
        pacienteId: "patient-001",
        nomeOriginal: "documento.pdf",
        nomeStorage: "file-1234567890-documento.pdf",
        mimeType: "application/pdf",
        tamanhoBytes: 1024,
        categoria: "CONTRATO",
        visibilidade: "RESTRITO",
        uploadedBy: testUserId,
      };

      const result = await service.create(input);

      expect(prisma.arquivo.create).toHaveBeenCalledWith({
        data: {
          clinic_id: testClinicId,
          paciente_id: "patient-001",
          consulta_id: null,
          orcamento_id: null,
          nome_original: "documento.pdf",
          nome_storage: "file-1234567890-documento.pdf",
          mime_type: "application/pdf",
          tamanho_bytes: 1024,
          categoria: "CONTRATO",
          visibilidade: "RESTRITO",
          uploaded_by: testUserId,
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("file-id-001");
      expect(result.nomeOriginal).toBe("documento.pdf");
      expect(result.categoria).toBe("CONTRATO");
    });

    it("should use default values for optional fields", async () => {
      const mockRecord = {
        id: "file-id-002",
        nome_original: "foto.jpg",
        nome_storage: "file-1234567890-foto.jpg",
        mime_type: "image/jpeg",
        tamanho_bytes: 2048,
        categoria: "OUTRO",
        visibilidade: "RESTRITO",
        created_at: new Date(),
      };

      (prisma.arquivo.create as jest.Mock).mockResolvedValue(mockRecord);

      const input = {
        clinicId: testClinicId,
        nomeOriginal: "foto.jpg",
        nomeStorage: "file-1234567890-foto.jpg",
        mimeType: "image/jpeg",
        tamanhoBytes: 2048,
        uploadedBy: testUserId,
      };

      const result = await service.create(input);

      expect(result.categoria).toBe("OUTRO");
      expect(result.visibilidade).toBe("RESTRITO");
    });
  });

  describe("list", () => {
    it("should list files filtered by clinicId", async () => {
      const mockRecords = [
        {
          id: "file-1",
          nome_original: "file1.pdf",
          mime_type: "application/pdf",
          tamanho_bytes: 100,
          categoria: "OUTRO",
          visibilidade: "RESTRITO",
          paciente_id: null,
          created_at: new Date(),
        },
        {
          id: "file-2",
          nome_original: "file2.jpg",
          mime_type: "image/jpeg",
          tamanho_bytes: 200,
          categoria: "OUTRO",
          visibilidade: "RESTRITO",
          paciente_id: null,
          created_at: new Date(),
        },
      ];

      (prisma.arquivo.findMany as jest.Mock).mockResolvedValue(mockRecords);

      const files = await service.list({ clinicId: testClinicId });

      expect(prisma.arquivo.findMany).toHaveBeenCalledWith({
        where: { clinic_id: testClinicId },
        orderBy: { created_at: "desc" },
        take: 1000,
      });

      expect(files).toHaveLength(2);
    });

    it("should filter by categoria", async () => {
      const mockRecords = [
        {
          id: "file-1",
          nome_original: "receita.pdf",
          mime_type: "application/pdf",
          tamanho_bytes: 100,
          categoria: "RECEITA",
          visibilidade: "RESTRITO",
          paciente_id: null,
          created_at: new Date(),
        },
      ];

      (prisma.arquivo.findMany as jest.Mock).mockResolvedValue(mockRecords);

      const files = await service.list({
        clinicId: testClinicId,
        categoria: "RECEITA",
      });

      expect(prisma.arquivo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            clinic_id: testClinicId,
            categoria: "RECEITA",
          },
        }),
      );

      expect(files).toHaveLength(1);
      expect(files[0].nomeOriginal).toBe("receita.pdf");
    });
  });

  describe("getById", () => {
    it("should return file by id and clinicId", async () => {
      const mockRecord = {
        id: "file-id-001",
        nome_original: "test.pdf",
        nome_storage: "storage.pdf",
        mime_type: "application/pdf",
        tamanho_bytes: 100,
        categoria: "OUTRO",
        visibilidade: "RESTRITO",
        paciente_id: null,
        consulta_id: null,
        orcamento_id: null,
        uploaded_by: testUserId,
        created_at: new Date(),
      };

      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(mockRecord);

      const found = await service.getById("file-id-001", testClinicId);

      expect(prisma.arquivo.findFirst).toHaveBeenCalledWith({
        where: {
          id: "file-id-001",
          clinic_id: testClinicId,
        },
      });

      expect(found).toBeDefined();
      expect(found?.nomeOriginal).toBe("test.pdf");
    });

    it("should return null for non-existent file", async () => {
      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(null);

      const found = await service.getById("non-existent-id", testClinicId);

      expect(found).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete file by id and clinicId", async () => {
      (prisma.arquivo.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const deleted = await service.delete("file-id-001", testClinicId);

      expect(prisma.arquivo.deleteMany).toHaveBeenCalledWith({
        where: {
          id: "file-id-001",
          clinic_id: testClinicId,
        },
      });

      expect(deleted).toBe(true);
    });

    it("should return false for non-existent file", async () => {
      (prisma.arquivo.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const deleted = await service.delete("non-existent-id", testClinicId);

      expect(deleted).toBe(false);
    });
  });

  describe("extractOCR", () => {
    it("should create an OCR record with status PROCESSANDO", async () => {
      const mockFile = {
        id: "file-id-001",
        clinic_id: testClinicId,
        nome_original: "doc.pdf",
      };

      const mockOCR = {
        id: "ocr-id-001",
        arquivo_id: "file-id-001",
        texto_extraido: null,
        status: "PROCESSANDO",
        idioma: "pt",
        confidence: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(mockFile);
      (prisma.arquivo_ocr.create as jest.Mock).mockResolvedValue(mockOCR);
      (prisma.arquivo.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.extractOCR("file-id-001", testClinicId);

      expect(prisma.arquivo_ocr.create).toHaveBeenCalledWith({
        data: {
          arquivo_id: "file-id-001",
          status: "PROCESSANDO",
          texto_extraido: null,
          idioma: "pt",
          confidence: null,
        },
      });
      expect(result.status).toBe("PROCESSANDO");
    });

    it("should throw not found if file does not exist", async () => {
      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.extractOCR("non-existent", testClinicId)).rejects.toThrow("not found");
    });
  });

  describe("getOCRResult", () => {
    it("should return the latest OCR result for a file", async () => {
      const mockFile = { id: "file-id-001", clinic_id: testClinicId };
      const mockOCR = {
        id: "ocr-id-001",
        arquivo_id: "file-id-001",
        texto_extraido: "extracted text",
        status: "CONCLUIDO",
        idioma: "pt",
        confidence: 0.95,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(mockFile);
      (prisma.arquivo_ocr.findFirst as jest.Mock).mockResolvedValue(mockOCR);

      const result = await service.getOCRResult("file-id-001", testClinicId);

      expect(result).not.toBeNull();
      expect(result?.textoExtraido).toBe("extracted text");
      expect(result?.status).toBe("CONCLUIDO");
    });

    it("should return null if no OCR result exists", async () => {
      const mockFile = { id: "file-id-001", clinic_id: testClinicId };

      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(mockFile);
      (prisma.arquivo_ocr.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getOCRResult("file-id-001", testClinicId);

      expect(result).toBeNull();
    });
  });

  describe("searchFilesByText", () => {
    it("should return files matching OCR text", async () => {
      const mockOCRs = [
        { arquivo_id: "file-1" },
        { arquivo_id: "file-2" },
      ];

      const mockFiles = [
        {
          id: "file-1",
          nome_original: "doc1.pdf",
          mime_type: "application/pdf",
          tamanho_bytes: 100,
          categoria: "OUTRO",
          visibilidade: "RESTRITO",
          paciente_id: null,
          created_at: new Date(),
        },
      ];

      (prisma.arquivo_ocr.findMany as jest.Mock).mockResolvedValue(mockOCRs);
      (prisma.arquivo.findMany as jest.Mock).mockResolvedValue(mockFiles);

      const result = await service.searchFilesByText(testClinicId, "receita");

      expect(prisma.arquivo_ocr.findMany).toHaveBeenCalledWith({
        where: {
          texto_extraido: { contains: "receita", mode: "insensitive" },
        },
        select: { arquivo_id: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0].nomeOriginal).toBe("doc1.pdf");
    });

    it("should return empty array when no matches", async () => {
      (prisma.arquivo_ocr.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.searchFilesByText(testClinicId, "nonexistent");

      expect(result).toHaveLength(0);
    });
  });

  describe("createVersion", () => {
    it("should create a new version and update file", async () => {
      const mockFile = { id: "file-id-001", clinic_id: testClinicId };
      const mockVersion = {
        id: "ver-id-001",
        arquivo_id: "file-id-001",
        numero_versao: 1,
        nome_storage: "v1.pdf",
        tamanho_bytes: 1024,
        url_temp: null,
        created_by: testUserId,
        created_at: new Date(),
      };

      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(mockFile);
      (prisma.arquivo_versao.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.arquivo_versao.create as jest.Mock).mockResolvedValue(mockVersion);
      (prisma.arquivo.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.createVersion("file-id-001", {
        nomeStorage: "v1.pdf",
        tamanhoBytes: 1024,
        createdBy: testUserId,
      }, testClinicId);

      expect(prisma.arquivo_versao.create).toHaveBeenCalledWith({
        data: {
          arquivo_id: "file-id-001",
          numero_versao: 1,
          nome_storage: "v1.pdf",
          tamanho_bytes: 1024,
          url_temp: null,
          created_by: testUserId,
        },
      });
      expect(result.numeroVersao).toBe(1);
    });

    it("should throw not found if file does not exist", async () => {
      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.createVersion("non-existent", {
        nomeStorage: "v1.pdf",
        tamanhoBytes: 1024,
        createdBy: testUserId,
      }, testClinicId)).rejects.toThrow("not found");
    });
  });

  describe("listVersions", () => {
    it("should list all versions for a file", async () => {
      const mockFile = { id: "file-id-001", clinic_id: testClinicId };
      const mockVersions = [
        {
          id: "ver-2",
          arquivo_id: "file-id-001",
          numero_versao: 2,
          nome_storage: "v2.pdf",
          tamanho_bytes: 2048,
          url_temp: null,
          created_by: testUserId,
          created_at: new Date(),
        },
        {
          id: "ver-1",
          arquivo_id: "file-id-001",
          numero_versao: 1,
          nome_storage: "v1.pdf",
          tamanho_bytes: 1024,
          url_temp: null,
          created_by: testUserId,
          created_at: new Date(),
        },
      ];

      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(mockFile);
      (prisma.arquivo_versao.findMany as jest.Mock).mockResolvedValue(mockVersions);

      const result = await service.listVersions("file-id-001", testClinicId);

      expect(result).toHaveLength(2);
      expect(result[0].numeroVersao).toBe(2);
      expect(result[1].numeroVersao).toBe(1);
    });
  });

  describe("restoreVersion", () => {
    it("should restore a version and update the file", async () => {
      const mockFile = {
        id: "file-id-001",
        clinic_id: testClinicId,
        nome_original: "doc.pdf",
        nome_storage: "current.pdf",
        mime_type: "application/pdf",
        tamanho_bytes: 1024,
        categoria: "OUTRO",
        visibilidade: "RESTRITO",
        paciente_id: null,
        consulta_id: null,
        orcamento_id: null,
        uploaded_by: testUserId,
        created_at: new Date(),
      };

      const mockVersion = {
        id: "ver-id-001",
        arquivo_id: "file-id-001",
        numero_versao: 1,
        nome_storage: "old.pdf",
        tamanho_bytes: 512,
        url_temp: null,
        created_by: testUserId,
        created_at: new Date(),
      };

      (prisma.arquivo.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockFile)
        .mockResolvedValueOnce({
          ...mockFile,
          nome_storage: mockVersion.nome_storage,
          tamanho_bytes: mockVersion.tamanho_bytes,
        });
      (prisma.arquivo_versao.findFirst as jest.Mock).mockResolvedValue(mockVersion);
      (prisma.arquivo.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.restoreVersion("file-id-001", "ver-id-001", testClinicId);

      expect(prisma.arquivo.updateMany).toHaveBeenCalledWith({
        where: { id: "file-id-001", clinic_id: testClinicId },
        data: {
          nome_storage: "old.pdf",
          tamanho_bytes: 512,
          versao_atual_id: "ver-id-001",
        },
      });
      expect(result.nomeStorage).toBe("old.pdf");
    });

    it("should throw not found if version does not exist", async () => {
      const mockFile = { id: "file-id-001", clinic_id: testClinicId };

      (prisma.arquivo.findFirst as jest.Mock).mockResolvedValue(mockFile);
      (prisma.arquivo_versao.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.restoreVersion("file-id-001", "bad-ver", testClinicId)).rejects.toThrow("not found");
    });
  });
});
