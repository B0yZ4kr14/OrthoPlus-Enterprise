import { Request, Response } from "express";

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    fidelidade_pontos: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    fidelidade_pacientes: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    fidelidade_badges: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    fidelidade_recompensas: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    fidelidade_indicacoes: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../../src/infrastructure/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { FidelidadeController } from "../../src/modules/fidelidade/api/controller";
import { prisma } from "../../src/infrastructure/database/prismaClient";

const controller = new FidelidadeController();

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

afterEach(() => jest.clearAllMocks());

describe("FidelidadeController", () => {
  // ── getPoints ───────────────────────────────────────────────────────────────
  describe("getPoints", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = { user: undefined, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.getPoints(req as Request, res)).rejects.toThrow("Missing clinic context");
    });

    it("returns all points for the clinic", async () => {
      const fake = [{ id: "p1", patient_id: "pat-1", amount: 100 }];
      (prisma as any).fidelidade_pontos.findMany.mockResolvedValueOnce(fake);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await controller.getPoints(req as Request, res);
      expect((prisma as any).fidelidade_pontos.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1" },
        orderBy: { created_at: "desc" },
      });
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("filters by patient_id when provided", async () => {
      const fake = [{ id: "p2", patient_id: "pat-2", amount: 50 }];
      (prisma as any).fidelidade_pontos.findMany.mockResolvedValueOnce(fake);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: { patient_id: "pat-2" }, params: {} };
      const res = mockRes();
      await controller.getPoints(req as Request, res);
      expect((prisma as any).fidelidade_pontos.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1", patient_id: "pat-2" },
        orderBy: { created_at: "desc" },
      });
    });

    it("returns 500 when database throws", async () => {
      (prisma as any).fidelidade_pontos.findMany.mockRejectedValueOnce(new Error("DB fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.getPoints(req as Request, res)).rejects.toThrow("DB fail");
    });
  });

  // ── addPoints ───────────────────────────────────────────────────────────────
  describe("addPoints", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = { user: undefined, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.addPoints(req as Request, res)).rejects.toThrow("Missing clinic context");
    });

    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { patient_id: "not-uuid", pontos: -5 }, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.addPoints(req as Request, res)).rejects.toThrow("Invalid input");
    });

    it("creates points atomically and returns 201 with accumulated points", async () => {
      const payload = { patient_id: "550e8400-e29b-41d4-a716-446655440000", pontos: 10, descricao: "Visita" };
      const created = { id: "p3", ...payload, clinic_id: "clinic-1" };
      const badges = [{ id: "b1", name: "Bronze", pontos_necessarios: 5 }];
      (prisma as any).fidelidade_pontos.create.mockResolvedValue(created);
      (prisma as any).fidelidade_pacientes.findFirst.mockResolvedValue({ id: "fp1", patient_id: payload.patient_id, pontos_acumulados: 25 });
      (prisma as any).fidelidade_pacientes.update.mockResolvedValue({ id: "fp1", patient_id: payload.patient_id, pontos_acumulados: 25 });
      (prisma as any).fidelidade_badges.findMany.mockResolvedValue(badges);
      (prisma as any).fidelidade_pacientes.findFirst.mockResolvedValue({ pontos_acumulados: 25 });
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: payload, query: {}, params: {} };
      const res = mockRes();
      await controller.addPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: "p3",
        pontos_acumulados: 25,
        badges_desbloqueados: badges,
      }));
    });

    it("unlocks badges when accumulated points reach threshold", async () => {
      const payload = { patient_id: "550e8400-e29b-41d4-a716-446655440000", pontos: 50, descricao: "Compra" };
      const created = { id: "p4", ...payload, clinic_id: "clinic-1" };
      const badges = [
        { id: "b1", name: "Bronze", pontos_necessarios: 10 },
        { id: "b2", name: "Silver", pontos_necessarios: 50 },
      ];
      (prisma as any).fidelidade_pontos.create.mockResolvedValue(created);
      (prisma as any).fidelidade_pacientes.findFirst.mockResolvedValue({ id: "fp1", patient_id: payload.patient_id, pontos_acumulados: 50 });
      (prisma as any).fidelidade_pacientes.update.mockResolvedValue({ id: "fp1", patient_id: payload.patient_id, pontos_acumulados: 50 });
      (prisma as any).fidelidade_badges.findMany.mockResolvedValue(badges);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: payload, query: {}, params: {} };
      const res = mockRes();
      await controller.addPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData.badges_desbloqueados).toHaveLength(2);
      expect(responseData.badges_desbloqueados[1].name).toBe("Silver");
    });

    it("returns 500 when database throws", async () => {
      (prisma as any).$transaction.mockRejectedValueOnce(new Error("DB fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { patient_id: "550e8400-e29b-41d4-a716-446655440000", pontos: 10 }, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.addPoints(req as Request, res)).rejects.toThrow("DB fail");
    });
  });

  // ── listBadges ──────────────────────────────────────────────────────────────
  describe("listBadges", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = { user: undefined, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.listBadges(req as Request, res)).rejects.toThrow("Missing clinic context");
    });

    it("returns badges for the clinic", async () => {
      const fake = [{ id: "b1", name: "Gold" }];
      (prisma as any).fidelidade_badges.findMany.mockResolvedValueOnce(fake);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await controller.listBadges(req as Request, res);
      expect((prisma as any).fidelidade_badges.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1" },
        orderBy: { name: "asc" },
      });
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("returns 500 on DB error", async () => {
      (prisma as any).fidelidade_badges.findMany.mockRejectedValueOnce(new Error("fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.listBadges(req as Request, res)).rejects.toThrow("fail");
    });
  });

  // ── createBadge ─────────────────────────────────────────────────────────────
  describe("createBadge", () => {
    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { nome: "" }, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.createBadge(req as Request, res)).rejects.toThrow("Invalid input");
    });

    it("creates badge and returns 201", async () => {
      const payload = { nome: "Silver", pontos_necessarios: 50 };
      const created = { id: "b2", ...payload, clinic_id: "clinic-1" };
      (prisma as any).fidelidade_badges.create.mockResolvedValueOnce(created);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: payload, query: {}, params: {} };
      const res = mockRes();
      await controller.createBadge(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
  });

  // ── listRecompensas ─────────────────────────────────────────────────────────
  describe("listRecompensas", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = { user: undefined, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.listRecompensas(req as Request, res)).rejects.toThrow("Missing clinic context");
    });

    it("filters by ativo query param", async () => {
      const fake = [{ id: "r1", ativo: true }];
      (prisma as any).fidelidade_recompensas.findMany.mockResolvedValueOnce(fake);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: { ativo: "true" }, params: {} };
      const res = mockRes();
      await controller.listRecompensas(req as Request, res);
      expect((prisma as any).fidelidade_recompensas.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1", is_active: true },
        orderBy: { points_cost: "asc" },
      });
    });

    it("returns 500 on DB error", async () => {
      (prisma as any).fidelidade_recompensas.findMany.mockRejectedValueOnce(new Error("fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.listRecompensas(req as Request, res)).rejects.toThrow("fail");
    });
  });

  // ── createRecompensa ────────────────────────────────────────────────────────
  describe("createRecompensa", () => {
    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { nome: "" }, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.createRecompensa(req as Request, res)).rejects.toThrow("Invalid input");
    });

    it("creates recompensa and returns 201", async () => {
      const payload = { nome: "Desconto 10%", pontos_necessarios: 100 };
      const created = { id: "r2", ...payload, clinic_id: "clinic-1" };
      (prisma as any).fidelidade_recompensas.create.mockResolvedValueOnce(created);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: payload, query: {}, params: {} };
      const res = mockRes();
      await controller.createRecompensa(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
  });

  // ── listIndicacoes ──────────────────────────────────────────────────────────
  describe("listIndicacoes", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = { user: undefined, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.listIndicacoes(req as Request, res)).rejects.toThrow("Missing clinic context");
    });

    it("filters by referrer_id", async () => {
      const fake = [{ id: "i1", referrer_id: "ref-1" }];
      (prisma as any).fidelidade_indicacoes.findMany.mockResolvedValueOnce(fake);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: { referrer_id: "ref-1" }, params: {} };
      const res = mockRes();
      await controller.listIndicacoes(req as Request, res);
      expect((prisma as any).fidelidade_indicacoes.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1", referrer_id: "ref-1" },
        orderBy: { created_at: "desc" },
      });
    });

    it("returns 500 on DB error", async () => {
      (prisma as any).fidelidade_indicacoes.findMany.mockRejectedValueOnce(new Error("fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.listIndicacoes(req as Request, res)).rejects.toThrow("fail");
    });
  });

  // ── createIndicacao ─────────────────────────────────────────────────────────
  describe("createIndicacao", () => {
    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { referrer_id: "bad-id" }, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.createIndicacao(req as Request, res)).rejects.toThrow("Invalid input");
    });

    it("creates indicacao and returns 201", async () => {
      const payload = {
        referrer_id: "550e8400-e29b-41d4-a716-446655440000",
        referred_patient_id: "550e8400-e29b-41d4-a716-446655440001",
      };
      const created = { id: "i2", ...payload, clinic_id: "clinic-1" };
      (prisma as any).fidelidade_indicacoes.create.mockResolvedValueOnce(created);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: payload, query: {}, params: {} };
      const res = mockRes();
      await controller.createIndicacao(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("returns 500 when database throws", async () => {
      (prisma as any).fidelidade_indicacoes.create.mockRejectedValueOnce(new Error("DB fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { referrer_id: "550e8400-e29b-41d4-a716-446655440000", referred_patient_id: "550e8400-e29b-41d4-a716-446655440001" }, query: {}, params: {} };
      const res = mockRes();
      await expect(controller.createIndicacao(req as Request, res)).rejects.toThrow("DB fail");
    });
  });
});
