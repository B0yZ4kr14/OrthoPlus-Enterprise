import { Request, Response } from "express";

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    procedimento_templates: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("../../src/infrastructure/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { ProcedimentosController } from "../../src/modules/procedimentos/api/controller";
import { prisma } from "../../src/infrastructure/database/prismaClient";

const controller = new ProcedimentosController();
const procedimentoTemplates = (prisma as any).procedimento_templates as Record<
  string,
  jest.Mock
>;

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

afterEach(() => jest.clearAllMocks());

describe("ProcedimentosController", () => {
  // ── listTemplates ───────────────────────────────────────────────────────────
  describe("listTemplates", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = {
        user: undefined,
        body: {},
        query: {},
        params: {},
      };
      const res = mockRes();
      await expect(
        controller.listTemplates(req as Request, res),
      ).rejects.toMatchObject({ status: 401 });
    });

    it("lists templates for the clinic", async () => {
      const templates = [{ id: "t1", nome: "Limpeza" }];
      procedimentoTemplates.findMany.mockResolvedValueOnce(templates);
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: {},
      };
      const res = mockRes();
      await controller.listTemplates(req as Request, res);
      expect(procedimentoTemplates.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1" },
        orderBy: { nome: "asc" },
      });
      expect(res.json).toHaveBeenCalledWith(templates);
    });

    it("filters by especialidade", async () => {
      const templates = [
        { id: "t2", nome: "Extração", especialidade: "Cirurgia" },
      ];
      procedimentoTemplates.findMany.mockResolvedValueOnce(templates);
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: { especialidade: "Cirurgia" },
        params: {},
      };
      const res = mockRes();
      await controller.listTemplates(req as Request, res);
      expect(procedimentoTemplates.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1", especialidade: "Cirurgia" },
        orderBy: { nome: "asc" },
      });
    });

    it("rejects on database error", async () => {
      procedimentoTemplates.findMany.mockRejectedValueOnce(
        new Error("DB fail"),
      );
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: {},
      };
      const res = mockRes();
      await expect(
        controller.listTemplates(req as Request, res),
      ).rejects.toThrow("DB fail");
    });
  });

  // ── getTemplateById ─────────────────────────────────────────────────────────
  describe("getTemplateById", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = {
        user: undefined,
        body: {},
        query: {},
        params: { id: "t-x" },
      };
      const res = mockRes();
      await expect(
        controller.getTemplateById(req as Request, res),
      ).rejects.toMatchObject({ status: 401 });
    });

    it("returns 404 when template not found", async () => {
      procedimentoTemplates.findFirst.mockResolvedValueOnce(null);
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: { id: "t-x" },
      };
      const res = mockRes();
      await expect(
        controller.getTemplateById(req as Request, res),
      ).rejects.toMatchObject({ status: 404 });
    });

    it("returns template when found", async () => {
      const template = { id: "t1", nome: "Limpeza" };
      procedimentoTemplates.findFirst.mockResolvedValueOnce(template);
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await controller.getTemplateById(req as Request, res);
      expect(res.json).toHaveBeenCalledWith(template);
    });

    it("rejects on database error", async () => {
      procedimentoTemplates.findFirst.mockRejectedValueOnce(
        new Error("DB fail"),
      );
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await expect(
        controller.getTemplateById(req as Request, res),
      ).rejects.toThrow("DB fail");
    });
  });

  // ── createTemplate ──────────────────────────────────────────────────────────
  describe("createTemplate", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = {
        user: undefined,
        body: {},
        query: {},
        params: {},
      };
      const res = mockRes();
      await expect(
        controller.createTemplate(req as Request, res),
      ).rejects.toMatchObject({ status: 401 });
    });

    it("returns 400 on invalid input", async () => {
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: { nome: "" },
        query: {},
        params: {},
      };
      const res = mockRes();
      await expect(
        controller.createTemplate(req as Request, res),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("creates template and returns 201", async () => {
      const payload = { nome: "Novo Procedimento", valor_sugerido: 100 };
      const created = { id: "t-new", ...payload, clinic_id: "clinic-1" };
      procedimentoTemplates.create.mockResolvedValueOnce(created);
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: payload,
        query: {},
        params: {},
      };
      const res = mockRes();
      await controller.createTemplate(req as Request, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("rejects on database error", async () => {
      procedimentoTemplates.create.mockRejectedValueOnce(new Error("DB fail"));
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: { nome: "Teste", valor_sugerido: 50 },
        query: {},
        params: {},
      };
      const res = mockRes();
      await expect(
        controller.createTemplate(req as Request, res),
      ).rejects.toThrow("DB fail");
    });
  });

  // ── updateTemplate ──────────────────────────────────────────────────────────
  describe("updateTemplate", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = {
        user: undefined,
        body: {},
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await expect(
        controller.updateTemplate(req as Request, res),
      ).rejects.toMatchObject({ status: 401 });
    });

    it("returns 404 when template not found", async () => {
      procedimentoTemplates.findFirst.mockResolvedValueOnce(null);
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: { id: "t-x" },
      };
      const res = mockRes();
      await expect(
        controller.updateTemplate(req as Request, res),
      ).rejects.toMatchObject({ status: 404 });
    });

    it("returns 400 on invalid input", async () => {
      procedimentoTemplates.findFirst.mockResolvedValueOnce({ id: "t1" });
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: { nome: "" },
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await expect(
        controller.updateTemplate(req as Request, res),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("updates and returns template", async () => {
      procedimentoTemplates.findFirst.mockResolvedValueOnce({
        id: "t1",
        nome: "Old",
      });
      const updated = { id: "t1", nome: "New" };
      procedimentoTemplates.update.mockResolvedValueOnce(updated);
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: { nome: "New" },
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await controller.updateTemplate(req as Request, res);
      expect(procedimentoTemplates.update).toHaveBeenCalledWith({
        where: { id: "t1" },
        data: { nome: "New" },
      });
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("rejects on database error", async () => {
      procedimentoTemplates.findFirst.mockResolvedValueOnce({ id: "t1" });
      procedimentoTemplates.update.mockRejectedValueOnce(new Error("DB fail"));
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: { nome: "New" },
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await expect(
        controller.updateTemplate(req as Request, res),
      ).rejects.toThrow("DB fail");
    });
  });

  // ── deleteTemplate ──────────────────────────────────────────────────────────
  describe("deleteTemplate", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req: Partial<Request> = {
        user: undefined,
        body: {},
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await expect(
        controller.deleteTemplate(req as Request, res),
      ).rejects.toMatchObject({ status: 401 });
    });

    it("deletes and returns 204", async () => {
      procedimentoTemplates.deleteMany.mockResolvedValueOnce({ count: 1 });
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await controller.deleteTemplate(req as Request, res);
      expect(procedimentoTemplates.deleteMany).toHaveBeenCalledWith({
        where: { id: "t1", clinic_id: "clinic-1" },
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("rejects on database error", async () => {
      procedimentoTemplates.deleteMany.mockRejectedValueOnce(
        new Error("DB fail"),
      );
      const req: Partial<Request> = {
        user: { clinicId: "clinic-1" } as any,
        body: {},
        query: {},
        params: { id: "t1" },
      };
      const res = mockRes();
      await expect(
        controller.deleteTemplate(req as Request, res),
      ).rejects.toThrow("DB fail");
    });
  });
});
