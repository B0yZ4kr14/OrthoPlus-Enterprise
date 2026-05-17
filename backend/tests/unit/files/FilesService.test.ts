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
});
