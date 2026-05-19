import { Request, Response } from "express";

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    fidelidade_pontos: {
      findMany: jest.fn(),
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
      await controller.getPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing clinic context" });
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
      await controller.getPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  // ── addPoints ───────────────────────────────────────────────────────────────
  describe("addPoints", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = { user: undefined, body: {}, query: {}, params: {} };
      const res = mockRes();
      await controller.addPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { patient_id: "not-uuid", pontos: -5 }, query: {}, params: {} };
      const res = mockRes();
      await controller.addPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("creates points and returns 201", async () => {
      const payload = { patient_id: "550e8400-e29b-41d4-a716-446655440000", pontos: 10, descricao: "Visita" };
      const created = { id: "p3", ...payload, clinic_id: "clinic-1" };
      (prisma as any).fidelidade_pontos.create.mockResolvedValueOnce(created);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: payload, query: {}, params: {} };
      const res = mockRes();
      await controller.addPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("returns 500 when database throws", async () => {
      (prisma as any).fidelidade_pontos.create.mockRejectedValueOnce(new Error("DB fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { patient_id: "550e8400-e29b-41d4-a716-446655440000", pontos: 10 }, query: {}, params: {} };
      const res = mockRes();
      await controller.addPoints(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── listBadges ──────────────────────────────────────────────────────────────
  describe("listBadges", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = { user: undefined, body: {}, query: {}, params: {} };
      const res = mockRes();
      await controller.listBadges(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns badges for the clinic", async () => {
      const fake = [{ id: "b1", name: "Gold" }];
      (prisma as any).fidelidade_badges.findMany.mockResolvedValueOnce(fake);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await controller.listBadges(req as Request, res);
      expect((prisma as any).fidelidade_badges.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1" },
        orderBy: { nome: "asc" },
      });
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    it("returns 500 on DB error", async () => {
      (prisma as any).fidelidade_badges.findMany.mockRejectedValueOnce(new Error("fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await controller.listBadges(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── createBadge ─────────────────────────────────────────────────────────────
  describe("createBadge", () => {
    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { nome: "" }, query: {}, params: {} };
      const res = mockRes();
      await controller.createBadge(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
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
      await controller.listRecompensas(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("filters by ativo query param", async () => {
      const fake = [{ id: "r1", ativo: true }];
      (prisma as any).fidelidade_recompensas.findMany.mockResolvedValueOnce(fake);
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: { ativo: "true" }, params: {} };
      const res = mockRes();
      await controller.listRecompensas(req as Request, res);
      expect((prisma as any).fidelidade_recompensas.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1", ativo: true },
        orderBy: { pontos_necessarios: "asc" },
      });
    });

    it("returns 500 on DB error", async () => {
      (prisma as any).fidelidade_recompensas.findMany.mockRejectedValueOnce(new Error("fail"));
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: {}, query: {}, params: {} };
      const res = mockRes();
      await controller.listRecompensas(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── createRecompensa ────────────────────────────────────────────────────────
  describe("createRecompensa", () => {
    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { nome: "" }, query: {}, params: {} };
      const res = mockRes();
      await controller.createRecompensa(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
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
      await controller.listIndicacoes(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(401);
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
      await controller.listIndicacoes(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── createIndicacao ─────────────────────────────────────────────────────────
  describe("createIndicacao", () => {
    it("returns 400 for invalid input", async () => {
      const req: Partial<Request> = { user: { clinicId: "clinic-1" } as any, body: { referrer_id: "bad-id" }, query: {}, params: {} };
      const res = mockRes();
      await controller.createIndicacao(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(400);
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
      await controller.createIndicacao(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
