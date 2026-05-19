/**
 * Unit tests for PacienteSearchService
 */

import { PacienteSearchService } from "../../src/modules/pacientes/application/services/PacienteSearchService";
import { prisma } from "../../src/infrastructure/database/prismaClient";

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    patients: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("PacienteSearchService", () => {
  let service: PacienteSearchService;

  beforeEach(() => {
    service = new PacienteSearchService();
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("should return paginated results with default limit", async () => {
      const mockPatients = [
        {
          id: "1",
          full_name: "Joao Silva",
          cpf: "00000000000",
          phone: "11999998888",
          email: "joao@example.com",
          status_code: "ATIVO",
          birth_date: new Date("1990-01-01"),
          photo_url: null,
          last_visit_date: new Date(),
        },
      ];

      (prisma.patients.findMany as jest.Mock).mockResolvedValue(mockPatients);
      (prisma.patients.count as jest.Mock).mockResolvedValue(1);

      const result = await service.search("clinic-1", {});

      expect(result.patients).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clinic_id: "clinic-1",
          }),
          take: 20,
          skip: 0,
        }),
      );
    });

    it("should filter by status", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { status: "ATIVO" });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "ATIVO",
          }),
        }),
      );
    });

    it("should search by name with case-insensitive match", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { query: "joao" });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                full_name: { contains: "joao", mode: "insensitive" },
              }),
            ]),
          }),
        }),
      );
    });

    it("should cap limit at 50", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { limit: 100 });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });

    it("should apply dentista filter", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { dentistaId: "dentista-1" });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dentista_responsavel_id: "dentista-1",
          }),
        }),
      );
    });

    it("should calculate correct pagination skip", async () => {
      (prisma.patients.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.patients.count as jest.Mock).mockResolvedValue(0);

      await service.search("clinic-1", { page: 3, limit: 10 });

      expect(prisma.patients.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });
});
