import { FuncionariosController } from "@/modules/funcionarios/api/controller";
import { IFuncionarioRepository } from "@/modules/funcionarios/domain/repositories/IFuncionarioRepository";

function mockReq(body = {}, params = {}, user = { clinicId: "clinic-001" }) {
  return { body, params, user } as any;
}

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

class MockFuncionarioRepository implements IFuncionarioRepository {
  findManyByClinic = jest.fn();
  findById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
}

describe("FuncionariosController", () => {
  let controller: FuncionariosController;
  let repo: MockFuncionarioRepository;

  beforeEach(() => {
    repo = new MockFuncionarioRepository();
    controller = new FuncionariosController(repo);
  });

  describe("list", () => {
    it("throws unauthorized when clinicId is missing", async () => {
      const req = mockReq({}, {}, {} as any);
      const res = mockRes();
      await expect(controller.list(req, res)).rejects.toThrow("Missing clinic context");
    });

    it("returns funcionarios for clinic", async () => {
      const req = mockReq();
      const res = mockRes();
      repo.findManyByClinic.mockResolvedValue([{ id: "f1", nome: "João" }]);
      await controller.list(req, res);
      expect(repo.findManyByClinic).toHaveBeenCalledWith("clinic-001");
      expect(res.json).toHaveBeenCalledWith([{ id: "f1", nome: "João" }]);
    });
  });

  describe("getById", () => {
    it("throws notFound when not found", async () => {
      const req = mockReq({}, { id: "f1" });
      const res = mockRes();
      repo.findById.mockResolvedValue(null);
      await expect(controller.getById(req, res)).rejects.toThrow("Funcionário");
    });

    it("returns funcionario when found", async () => {
      const req = mockReq({}, { id: "f1" });
      const res = mockRes();
      repo.findById.mockResolvedValue({ id: "f1", nome: "João" });
      await controller.getById(req, res);
      expect(repo.findById).toHaveBeenCalledWith("f1", "clinic-001");
      expect(res.json).toHaveBeenCalledWith({ id: "f1", nome: "João" });
    });
  });

  describe("create", () => {
    it("throws validation on invalid input", async () => {
      const req = mockReq({ nome: "" });
      const res = mockRes();
      await expect(controller.create(req, res)).rejects.toThrow("Invalid input");
    });

    it("creates funcionario with clinic_id", async () => {
      const req = mockReq({
        nome: "João",
        cargo: "Dentista",
        email: "joao@clinic.com",
        celular: "11999999999",
        cpf: "12345678901",
        data_nascimento: "1990-01-01",
        data_admissao: "2024-01-01",
        permissoes: [],
      });
      const res = mockRes();
      repo.create.mockResolvedValue({ id: "f1", nome: "João" });
      await controller.create(req, res);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: "João",
          cargo: "Dentista",
          clinic_id: "clinic-001",
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("update", () => {
    it("throws validation on invalid input", async () => {
      const req = mockReq({ nome: 123 }, { id: "f1" });
      const res = mockRes();
      await expect(controller.update(req, res)).rejects.toThrow("Invalid input");
    });

    it("updates funcionario", async () => {
      const req = mockReq({ nome: "João Silva" }, { id: "f1" });
      const res = mockRes();
      repo.update.mockResolvedValue({ id: "f1", nome: "João Silva" });
      await controller.update(req, res);
      expect(repo.update).toHaveBeenCalledWith("f1", { nome: "João Silva" });
      expect(res.json).toHaveBeenCalledWith({ id: "f1", nome: "João Silva" });
    });
  });

  describe("delete", () => {
    it("deletes funcionario", async () => {
      const req = mockReq({}, { id: "f1" });
      const res = mockRes();
      repo.delete.mockResolvedValue(undefined);
      await controller.delete(req, res);
      expect(repo.delete).toHaveBeenCalledWith("f1");
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
