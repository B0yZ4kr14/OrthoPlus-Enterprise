import { Request, Response, NextFunction } from "express";
import { TeleodontoController } from "../../src/modules/teleodonto/api/controller";

type MockService = {
  listTeleconsultas: jest.Mock;
  getById: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  startSession: jest.Mock;
  endSession: jest.Mock;
  addNotes: jest.Mock;
  addPrescription: jest.Mock;
};

const mockService: MockService = {
  listTeleconsultas: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  startSession: jest.fn(),
  endSession: jest.fn(),
  addNotes: jest.fn(),
  addPrescription: jest.fn(),
};

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

describe("TeleodontoController", () => {
  let controller: TeleodontoController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TeleodontoController(mockService as any);
  });

  describe("listTeleconsultas", () => {
    test("should call next with 401 error when clinicId is missing", async () => {
      const req = createReq({ user: {} });
      const res = createRes();
      const next = createNext();

      await controller.listTeleconsultas(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((next as jest.Mock).mock.calls[0][0]).toMatchObject({
        status: 401,
        code: "AUTH_UNAUTHORIZED",
      });
    });

    test("should list teleconsultas with clinic filter", async () => {
      const req = createReq();
      const res = createRes();
      const next = createNext();
      mockService.listTeleconsultas.mockResolvedValue([
        { id: "1", titulo: "Test" },
      ]);

      await controller.listTeleconsultas(req, res, next);

      expect(mockService.listTeleconsultas).toHaveBeenCalledWith(
        "clinic-1",
        {},
      );
      expect(jsonMock).toHaveBeenCalledWith([{ id: "1", titulo: "Test" }]);
      expect(next).not.toHaveBeenCalled();
    });

    test("should pass status and dentist_id filters", async () => {
      const req = createReq({
        query: { status: "AGENDADO", dentist_id: "dentist-1" },
      });
      const res = createRes();
      const next = createNext();
      mockService.listTeleconsultas.mockResolvedValue([]);

      await controller.listTeleconsultas(req, res, next);

      expect(mockService.listTeleconsultas).toHaveBeenCalledWith("clinic-1", {
        status: "AGENDADO",
        dentist_id: "dentist-1",
      });
    });
  });

  describe("getById", () => {
    test("should return teleconsulta by id", async () => {
      const req = createReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      });
      const res = createRes();
      const next = createNext();
      mockService.getById.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Test",
      });

      await controller.getById(req, res, next);

      expect(mockService.getById).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        "clinic-1",
      );
      expect(jsonMock).toHaveBeenCalledWith({
        id: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Test",
      });
    });

    test("should call next with 401 when clinicId is missing", async () => {
      const req = createReq({ user: {} });
      const res = createRes();
      const next = createNext();

      await controller.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 }),
      );
    });
  });

  describe("create", () => {
    test("should create teleconsulta with valid data", async () => {
      const req = createReq({
        body: {
          titulo: "Consulta Test",
          motivo: "Checkup",
          tipo: "ROTINA",
          data_agendada: "2026-05-25T10:00:00Z",
          patient_id: "550e8400-e29b-41d4-a716-446655440001",
          dentist_id: "550e8400-e29b-41d4-a716-446655440002",
        },
      });
      const res = createRes();
      const next = createNext();
      mockService.create.mockResolvedValue({
        id: "tc-new",
        titulo: "Consulta Test",
      });

      await controller.create(req, res, next);

      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: "Consulta Test" }),
        "clinic-1",
        "user-1",
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        id: "tc-new",
        titulo: "Consulta Test",
      });
    });

    test("should call next with 400 when validation fails", async () => {
      const req = createReq({ body: { titulo: "" } });
      const res = createRes();
      const next = createNext();

      await controller.create(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ status: 400 }),
      );
    });
  });

  describe("update", () => {
    test("should update teleconsulta with valid data", async () => {
      const req = createReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
        body: { titulo: "Updated" },
      });
      const res = createRes();
      const next = createNext();
      mockService.update.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Updated",
      });

      await controller.update(req, res, next);

      expect(mockService.update).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        { titulo: "Updated" },
        "clinic-1",
      );
      expect(jsonMock).toHaveBeenCalledWith({
        id: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Updated",
      });
    });
  });

  describe("delete", () => {
    test("should delete teleconsulta and return 204", async () => {
      const req = createReq({
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      });
      const res = createRes();
      const next = createNext();
      mockService.delete.mockResolvedValue({ count: 1 });

      await controller.delete(req, res, next);

      expect(mockService.delete).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
        "clinic-1",
      );
      expect(statusMock).toHaveBeenCalledWith(204);
    });
  });

  describe("startSession", () => {
    test("should start session and update status", async () => {
      const req = createReq({
        body: { teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000" },
      });
      const res = createRes();
      const next = createNext();
      mockService.startSession.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        status: "EM_ANDAMENTO",
      });

      await controller.startSession(req, res, next);

      expect(mockService.startSession).toHaveBeenCalledWith(
        { teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000" },
        "clinic-1",
      );
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "EM_ANDAMENTO",
          message: "Session started successfully",
        }),
      );
    });
  });

  describe("endSession", () => {
    test("should end session and record duration", async () => {
      const req = createReq({
        body: {
          teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000",
          duration_minutes: 30,
        },
      });
      const res = createRes();
      const next = createNext();
      mockService.endSession.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        status: "CONCLUIDO",
      });

      await controller.endSession(req, res, next);

      expect(mockService.endSession).toHaveBeenCalledWith(
        {
          teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000",
          duration_minutes: 30,
        },
        "clinic-1",
      );
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "CONCLUIDO",
          message: "Session ended successfully",
        }),
      );
    });
  });

  describe("addNotes", () => {
    test("should add clinical notes to teleconsulta", async () => {
      const req = createReq({
        body: {
          teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000",
          notes: "Paciente apresenta melhora",
          diagnosis: "Gengivite leve",
        },
      });
      const res = createRes();
      const next = createNext();
      mockService.addNotes.mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        observacoes: "Paciente apresenta melhora",
      });

      await controller.addNotes(req, res, next);

      expect(mockService.addNotes).toHaveBeenCalledWith(
        expect.objectContaining({
          teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000",
          notes: "Paciente apresenta melhora",
        }),
        "clinic-1",
      );
    });
  });

  describe("addPrescription", () => {
    test("should add prescription with medications", async () => {
      const req = createReq({
        body: {
          teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000",
          patient_id: "550e8400-e29b-41d4-a716-446655440001",
          medications: [
            {
              name: "Amoxicilina",
              dosage: "500mg",
              frequency: "8/8h",
              duration: "7 dias",
            },
          ],
        },
      });
      const res = createRes();
      const next = createNext();
      mockService.addPrescription.mockResolvedValue({
        data: { id: "550e8400-e29b-41d4-a716-446655440000" },
        prescription: { medications: [{ name: "Amoxicilina" }] },
      });

      await controller.addPrescription(req, res, next);

      expect(mockService.addPrescription).toHaveBeenCalledWith(
        expect.objectContaining({
          teleconsulta_id: "550e8400-e29b-41d4-a716-446655440000",
          patient_id: "550e8400-e29b-41d4-a716-446655440001",
        }),
        "clinic-1",
        "user-1",
      );
    });
  });
});
