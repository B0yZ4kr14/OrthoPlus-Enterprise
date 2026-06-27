import { OrcamentoService } from "../../src/modules/orcamentos/application/services/OrcamentoService";
import { IOrcamentoRepository } from "../../src/modules/orcamentos/domain/repositories/IOrcamentoRepository";
import { orcamentos, orcamento_itens } from "@prisma/client";

const mockRepo: jest.Mocked<IOrcamentoRepository> = {
  listOrcamentos: jest.fn(),
  getOrcamentoById: jest.fn(),
  createOrcamento: jest.fn(),
  updateOrcamento: jest.fn(),
  deleteOrcamento: jest.fn(),
  listItems: jest.fn(),
  addItem: jest.fn(),
} as any;

const sampleOrcamento: orcamentos = {
  id: "orc-1",
  clinic_id: "clinic-1",
  patient_id: "patient-1",
  numero_orcamento: "ORC-001",
  titulo: "Orçamento Teste",
  tipo_plano: "PADRAO",
  status: "RASCUNHO",
  valor_total: 1000,
  valor_final: 1000,
  validade_dias: 30,
  data_validade: new Date().toISOString(),
  created_by: "user-1",
  created_at: new Date(),
  updated_at: new Date(),
  aprovado_em: null,
  aprovado_por: null,
  convertido_em: null,
  desconto_percentual: null,
  desconto_valor: null,
  descricao: null,
  motivo_rejeicao: null,
  observacoes: null,
  prontuario_id: null,
  rejeitado_em: null,
} as any;

const sampleItem: orcamento_itens = {
  id: "item-1",
  clinic_id: "clinic-1",
  orcamento_id: "orc-1",
  descricao: "Limpeza",
  ordem: 1,
  quantidade: 1,
  valor_unitario: 100,
  valor_total: 100,
  created_at: new Date(),
  dente_codigo: null,
  observacoes: null,
  procedimento_id: null,
} as any;

describe("OrcamentoService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("addItem", () => {
    it("includes clinic_id when adding an item", async () => {
      mockRepo.getOrcamentoById.mockResolvedValueOnce(sampleOrcamento);
      mockRepo.addItem.mockResolvedValueOnce(sampleItem);

      const service = new OrcamentoService(mockRepo);
      const result = await service.addItem("orc-1", {
        descricao: "Limpeza",
        ordem: 1,
        quantidade: 1,
        valor_unitario: 100,
        valor_total: 100,
      }, "clinic-1");

      expect(mockRepo.getOrcamentoById).toHaveBeenCalledWith("orc-1", "clinic-1");
      expect(mockRepo.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          orcamento_id: "orc-1",
          clinic_id: "clinic-1",
          descricao: "Limpeza",
        }),
      );
      expect(result).toEqual(sampleItem);
    });

    it("returns null when orcamento is not found", async () => {
      mockRepo.getOrcamentoById.mockResolvedValueOnce(null);

      const service = new OrcamentoService(mockRepo);
      const result = await service.addItem("orc-missing", {
        descricao: "Limpeza",
        ordem: 1,
        quantidade: 1,
        valor_unitario: 100,
        valor_total: 100,
      }, "clinic-1");

      expect(result).toBeNull();
      expect(mockRepo.addItem).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("includes clinic_id when creating orcamento", async () => {
      mockRepo.createOrcamento.mockResolvedValueOnce(sampleOrcamento);

      const service = new OrcamentoService(mockRepo);
      await service.create(
        {
          numero_orcamento: "ORC-002",
          titulo: "Novo Orçamento",
          patient_id: "patient-1",
          tipo_plano: "PADRAO",
          valor_total: 500,
          created_by: "user-1",
        },
        "clinic-1",
      );

      expect(mockRepo.createOrcamento).toHaveBeenCalledWith(
        expect.objectContaining({
          clinic_id: "clinic-1",
          numero_orcamento: "ORC-002",
        }),
      );
    });
  });
});
