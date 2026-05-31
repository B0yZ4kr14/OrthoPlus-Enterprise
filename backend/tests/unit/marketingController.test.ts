import { Request, Response, NextFunction } from "express";

const mockPrisma = {
  marketing_campaigns: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  campanha_envios: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  recalls: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  campaign_triggers: {
    findMany: jest.fn(),
  },
  appointments: {
    findMany: jest.fn(),
  },
  patients: {
    findMany: jest.fn(),
  },
  notifications: {
    create: jest.fn(),
  },
};

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: mockPrisma,
}));

jest.mock("../../src/infrastructure/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { MarketingController } from "../../src/modules/marketing/api/controller";

const jsonMock = jest.fn();
const statusMock = jest
  .fn()
  .mockReturnValue({ json: jsonMock, send: jest.fn() });

const createRes = () => {
  return {
    status: statusMock,
    json: jsonMock,
    send: jest.fn(),
  } as unknown as Response;
};

const createReq = (overrides = {}) => {
  return {
    user: { clinicId: "clinic-1", id: "user-1" },
    query: {},
    params: {},
    body: {},
    ...overrides,
  } as unknown as Request;
};

const createNext = () => jest.fn() as unknown as NextFunction;

describe("MarketingController", () => {
  let controller: MarketingController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MarketingController();
  });

  // ── listCampanhas ──────────────────────────────────────────────────────────
  describe("listCampanhas", () => {
    test("should list campaigns with clinic filter", async () => {
      const req = createReq();
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.findMany.mockResolvedValue([
        { id: "c1", name: "Test" },
      ]);

      await controller.listCampanhas(req, res, next);

      expect(mockPrisma.marketing_campaigns.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clinic_id: "clinic-1" } }),
      );
      expect(jsonMock).toHaveBeenCalledWith([{ id: "c1", name: "Test" }]);
      expect(next).not.toHaveBeenCalled();
    });

    test("should pass status filter", async () => {
      const req = createReq({ query: { status: "ACTIVE" } });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.findMany.mockResolvedValue([]);

      await controller.listCampanhas(req, res, next);

      expect(mockPrisma.marketing_campaigns.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clinic_id: "clinic-1", status: "ACTIVE" },
        }),
      );
    });

    test("should call next with 401 when clinicId is missing", async () => {
      const req = createReq({ user: {} });
      const res = createRes();
      const next = createNext();

      await controller.listCampanhas(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((next as jest.Mock).mock.calls[0][0]).toMatchObject({
        status: 401,
      });
    });
  });

  // ── getCampanhaById ────────────────────────────────────────────────────────
  describe("getCampanhaById", () => {
    test("should return campaign by id", async () => {
      const req = createReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.findFirst.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test",
      });

      await controller.getCampanhaById(req, res, next);

      expect(mockPrisma.marketing_campaigns.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            clinic_id: "clinic-1",
          },
        }),
      );
      expect(jsonMock).toHaveBeenCalledWith({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test",
      });
    });

    test("should call next with 404 when not found", async () => {
      const req = createReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.findFirst.mockResolvedValue(null);

      await controller.getCampanhaById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ status: 404 }),
      );
    });
  });

  // ── createCampanha ─────────────────────────────────────────────────────────
  describe("createCampanha", () => {
    test("should create campaign with valid data", async () => {
      const req = createReq({
        body: {
          name: "Campanha Test",
          campaign_type: "EMAIL",
          channel: "EMAIL",
          status: "ACTIVE",
        },
      });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.create.mockResolvedValue({
        id: "c-new",
        name: "Campanha Test",
      });

      await controller.createCampanha(req, res, next);

      expect(mockPrisma.marketing_campaigns.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Campanha Test",
            clinic_id: "clinic-1",
          }),
        }),
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        id: "c-new",
        name: "Campanha Test",
      });
    });

    test("should call next with 400 when validation fails", async () => {
      const req = createReq({ body: { name: "" } });
      const res = createRes();
      const next = createNext();

      await controller.createCampanha(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ status: 400 }),
      );
    });
  });

  // ── updateCampanha ─────────────────────────────────────────────────────────
  describe("updateCampanha", () => {
    test("should update campaign with valid data", async () => {
      const req = createReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
        body: { name: "Updated" },
      });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.findFirst.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      mockPrisma.marketing_campaigns.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.marketing_campaigns.findFirst.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Updated",
      });

      await controller.updateCampanha(req, res, next);

      expect(mockPrisma.marketing_campaigns.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "550e8400-e29b-41d4-a716-446655440000", clinic_id: "clinic-1" },
          data: { name: "Updated" },
        }),
      );
      expect(jsonMock).toHaveBeenCalledWith({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Updated",
      });
    });
  });

  // ── deleteCampanha ─────────────────────────────────────────────────────────
  describe("deleteCampanha", () => {
    test("should delete campaign and return 204", async () => {
      const req = createReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.deleteMany.mockResolvedValue({ count: 1 });

      await controller.deleteCampanha(req, res, next);

      expect(mockPrisma.marketing_campaigns.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            clinic_id: "clinic-1",
          },
        }),
      );
      expect(statusMock).toHaveBeenCalledWith(204);
    });
  });

  // ── createEnvio ────────────────────────────────────────────────────────────
  describe("createEnvio", () => {
    test("should create envio with campaign link", async () => {
      const req = createReq({
        body: {
          campanha_id: "550e8400-e29b-41d4-a716-446655440000",
          destinatario_id: "550e8400-e29b-41d4-a716-446655440001",
          destinatario_tipo: "PATIENT",
        },
      });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.findFirst.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      mockPrisma.campanha_envios.create.mockResolvedValue({
        id: "e1",
        campanha_id: "550e8400-e29b-41d4-a716-446655440000",
      });

      await controller.createEnvio(req, res, next);

      expect(mockPrisma.campanha_envios.create).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
    });

    test("should call next with 404 when campaign not found", async () => {
      const req = createReq({
        body: {
          campanha_id: "550e8400-e29b-41d4-a716-446655440000",
          destinatario_id: "550e8400-e29b-41d4-a716-446655440001",
          destinatario_tipo: "PATIENT",
        },
      });
      const res = createRes();
      const next = createNext();
      mockPrisma.marketing_campaigns.findFirst.mockResolvedValue(null);

      await controller.createEnvio(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ status: 404 }),
      );
    });
  });

  // ── processRecalls ─────────────────────────────────────────────────────────
  describe("processRecalls", () => {
    test("should process recalls batch", async () => {
      const req = createReq();
      const res = createRes();
      const next = createNext();
      mockPrisma.recalls.findMany.mockResolvedValue([
        {
          id: "r1",
          patient_id: "p1",
          patient: { full_name: "João", email: "joao@test.com" },
          tipo_recall: "Retorno",
          data_prevista: new Date().toISOString(),
          mensagem_personalizada: null,
          metodo_notificacao: "EMAIL",
        },
      ]);
      mockPrisma.notifications.create.mockResolvedValue({});
      mockPrisma.recalls.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.recalls.findFirst.mockResolvedValue({});

      await controller.processRecalls(req, res, next);

      expect(mockPrisma.recalls.findMany).toHaveBeenCalled();
      expect(mockPrisma.notifications.create).toHaveBeenCalled();
      expect(mockPrisma.recalls.updateMany).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, processed: 1 }),
      );
    });

    test("should return 0 processed when no pending recalls", async () => {
      const req = createReq();
      const res = createRes();
      const next = createNext();
      mockPrisma.recalls.findMany.mockResolvedValue([]);

      await controller.processRecalls(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, processed: 0 }),
      );
    });
  });
});
