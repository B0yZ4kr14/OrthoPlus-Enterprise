import { Request, Response } from "express";

// ── Mock asyncHandler so thrown ApiErrors are converted to res.status().json()
// in tests (the real wrapper delegates to Express error middleware via next()).
jest.mock("../../src/middleware/errorHandler", () => ({
  ...jest.requireActual("../../src/middleware/errorHandler"),
  asyncHandler: (fn: any) => async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      if (err.status && res.status) {
        res.status(err.status).json({ error: err.message });
      } else if (res.status) {
        res.status(500).json({ error: err.message || "Internal server error" });
      } else {
        next(err);
      }
    }
  },
}));

// ── Mock Prisma client ──
jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    crm_leads: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { CRMController } from "../../src/modules/crm/api/controller";
import { prisma } from "../../src/infrastructure/database/prismaClient";

const crmLeads = (prisma as any).crm_leads as Record<string, jest.Mock>;

const controller = new CRMController();

// ── Helpers de mock ──
const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = (
  body = {},
  params = {},
  query = {},
  user?: { clinicId?: string; role?: string },
): Partial<Request> => ({
  body,
  params: params as Request["params"],
  query: query as Request["query"],
  user: user as Request["user"],
});

// ── Suíte de testes ──
describe("CRMController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listLeads", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req = mockReq({}, {}, {}, undefined);
      const res = mockRes();
      await controller.listLeads(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing clinic context" }),
      );
    });

    it("returns leads for clinic without status filter", async () => {
      const leads = [{ id: "lead-1", name: "João" }];
      crmLeads.findMany.mockResolvedValueOnce(leads);

      const req = mockReq({}, {}, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.listLeads(req as Request, res, jest.fn());

      expect(crmLeads.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1" },
        orderBy: { created_at: "desc" },
      });
      expect(res.json).toHaveBeenCalledWith(leads);
    });

    it("returns leads for clinic with optional status filter", async () => {
      const leads = [{ id: "lead-1", name: "João", status: "novo" }];
      crmLeads.findMany.mockResolvedValueOnce(leads);

      const req = mockReq({}, {}, { status: "novo" }, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.listLeads(req as Request, res, jest.fn());

      expect(crmLeads.findMany).toHaveBeenCalledWith({
        where: { clinic_id: "clinic-1", status: "novo" },
        orderBy: { created_at: "desc" },
      });
      expect(res.json).toHaveBeenCalledWith(leads);
    });

    it("returns 500 on database error", async () => {
      crmLeads.findMany.mockRejectedValueOnce(new Error("DB error"));

      const req = mockReq({}, {}, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.listLeads(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getLeadById", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req = mockReq({}, { id: "lead-1" }, {}, undefined);
      const res = mockRes();
      await controller.getLeadById(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing clinic context" }),
      );
    });

    it("returns 404 when lead not found", async () => {
      crmLeads.findFirst.mockResolvedValueOnce(null);

      const req = mockReq({}, { id: "lead-x" }, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.getLeadById(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns lead when found", async () => {
      const lead = { id: "lead-1", name: "Maria" };
      crmLeads.findFirst.mockResolvedValueOnce(lead);

      const req = mockReq({}, { id: "lead-1" }, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.getLeadById(req as Request, res, jest.fn());
      expect(res.json).toHaveBeenCalledWith(lead);
    });
  });

  describe("createLead", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req = mockReq({ name: "Novo Lead" }, {}, {}, undefined);
      const res = mockRes();
      await controller.createLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing clinic context" }),
      );
    });

    it("returns 400 on validation error (invalid email)", async () => {
      const req = mockReq(
        { name: "Lead", email: "not-an-email" },
        {},
        {},
        { clinicId: "clinic-1" },
      );
      const res = mockRes();

      await controller.createLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 on validation error (invalid name type)", async () => {
      const req = mockReq({ name: 123 }, {}, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.createLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("creates and returns 201 on valid input", async () => {
      const payload = { name: "Novo Lead", email: "lead@test.com" };
      const created = { id: "lead-new", ...payload, clinic_id: "clinic-1" };
      crmLeads.create.mockResolvedValueOnce(created);

      const req = mockReq(payload, {}, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.createLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("returns 500 on database error", async () => {
      crmLeads.create.mockRejectedValueOnce(new Error("DB error"));

      const req = mockReq({ name: "Lead" }, {}, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.createLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateLead", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req = mockReq({ name: "Updated" }, { id: "lead-1" }, {}, undefined);
      const res = mockRes();
      await controller.updateLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing clinic context" }),
      );
    });

    it("returns 404 when lead does not exist", async () => {
      crmLeads.findFirst.mockResolvedValueOnce(null);

      const req = mockReq(
        { name: "Updated" },
        { id: "lead-x" },
        {},
        { clinicId: "clinic-1" },
      );
      const res = mockRes();

      await controller.updateLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 on validation error (invalid email)", async () => {
      const existing = { id: "lead-1", name: "Old" };
      crmLeads.findFirst.mockResolvedValueOnce(existing);

      const req = mockReq(
        { email: "invalid" },
        { id: "lead-1" },
        {},
        { clinicId: "clinic-1" },
      );
      const res = mockRes();

      await controller.updateLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("updates and returns lead on valid input", async () => {
      const existing = { id: "lead-1", name: "Old" };
      const updated = { id: "lead-1", name: "New" };
      crmLeads.findFirst.mockResolvedValueOnce(existing);
      crmLeads.update.mockResolvedValueOnce(updated);

      const req = mockReq(
        { name: "New" },
        { id: "lead-1" },
        {},
        { clinicId: "clinic-1" },
      );
      const res = mockRes();

      await controller.updateLead(req as Request, res, jest.fn());
      expect(crmLeads.update).toHaveBeenCalledWith({
        where: { id: "lead-1" },
        data: { name: "New" },
      });
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("returns 500 on database error during update", async () => {
      const existing = { id: "lead-1", name: "Old" };
      crmLeads.findFirst.mockResolvedValueOnce(existing);
      crmLeads.update.mockRejectedValueOnce(new Error("DB error"));

      const req = mockReq(
        { name: "New" },
        { id: "lead-1" },
        {},
        { clinicId: "clinic-1" },
      );
      const res = mockRes();

      await controller.updateLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteLead", () => {
    it("returns 401 when clinicId is missing", async () => {
      const req = mockReq({}, { id: "lead-1" }, {}, undefined);
      const res = mockRes();
      await controller.deleteLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing clinic context" }),
      );
    });

    it("returns 404 when lead not found", async () => {
      crmLeads.findFirst.mockResolvedValueOnce(null);

      const req = mockReq({}, { id: "lead-x" }, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.deleteLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 204 on successful delete", async () => {
      const existing = { id: "lead-1", name: "Lead" };
      crmLeads.findFirst.mockResolvedValueOnce(existing);
      crmLeads.delete.mockResolvedValueOnce(undefined);

      const req = mockReq({}, { id: "lead-1" }, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.deleteLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("returns 500 on database error during delete", async () => {
      const existing = { id: "lead-1", name: "Lead" };
      crmLeads.findFirst.mockResolvedValueOnce(existing);
      crmLeads.delete.mockRejectedValueOnce(new Error("DB error"));

      const req = mockReq({}, { id: "lead-1" }, {}, { clinicId: "clinic-1" });
      const res = mockRes();

      await controller.deleteLead(req as Request, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
