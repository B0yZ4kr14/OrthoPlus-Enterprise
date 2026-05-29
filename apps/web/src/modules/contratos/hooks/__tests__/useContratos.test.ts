import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mutable auth state so individual tests can change clinic
const authState: { selectedClinic: { id: string } | null } = {
  selectedClinic: { id: "clinic-1" },
};

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

import { toast } from "sonner";
import { useContratos } from "../useContratos";

const mockContrato: any = {
  id: "c1",
  clinic_id: "clinic-1",
  patient_id: "p1",
  orcamento_id: null,
  template_id: "t1",
  numero_contrato: "CTR-1234567890",
  titulo: "Contrato de Tratamento",
  conteudo_html: "<p>Conteúdo</p>",
  valor_contrato: 5000,
  data_inicio: "2024-01-01",
  data_termino: null,
  renovacao_automatica: false,
  status: "AGUARDANDO_ASSINATURA",
  patient_name: "João Silva",
  template_name: "Template Padrão",
  assinado_em: null,
  anexos: [],
};

const mockContrato2: any = {
  ...mockContrato,
  id: "c2",
  numero_contrato: "CTR-0987654321",
  titulo: "Contrato de Ortodontia",
  status: "ASSINADO",
  patient_id: "p2",
  patient_name: "Maria Souza",
  valor_contrato: 8000,
};

const mockContrato3: any = {
  ...mockContrato,
  id: "c3",
  numero_contrato: "CTR-5555555555",
  titulo: "Contrato de Clareamento",
  status: "CANCELADO",
  patient_id: "p3",
  patient_name: "Pedro Santos",
  valor_contrato: 2000,
};

const mockTemplate: any = {
  id: "t1",
  clinic_id: "clinic-1",
  nome: "Template Padrão",
  tipo_tratamento: "Geral",
  conteudo_html: "<p>Template</p>",
  variaveis_disponiveis: {},
  ativo: true,
};

describe("useContratos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPut.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
    authState.selectedClinic = { id: "clinic-1" };
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─────────────────────────────────────────────────────────────
  // loadContratos / loadTemplates on mount
  // ─────────────────────────────────────────────────────────────

  it("should load contratos and templates on mount", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    const { result } = renderHook(() => useContratos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.contratos).toHaveLength(1);
    expect(result.current.contratos[0].titulo).toBe("Contrato de Tratamento");
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].nome).toBe("Template Padrão");
    expect(mockGet).toHaveBeenCalledWith("/contratos", {
      params: { clinic_id: "clinic-1", sort: "created_at.desc" },
    });
    expect(mockGet).toHaveBeenCalledWith("/contrato-templates", {
      params: { clinic_id: "clinic-1", ativo: "eq.true", sort: "nome.asc" },
    });
  });

  it("should not fetch data when clinic is null", async () => {
    authState.selectedClinic = null;

    const { result } = renderHook(() => useContratos());

    // Hook does not set loading to false when clinic is null (early return)
    expect(result.current.loading).toBe(true);
    expect(result.current.contratos).toHaveLength(0);
    expect(result.current.templates).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should show toast.error when loading contratos fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    mockGet.mockResolvedValueOnce([mockTemplate]);

    const { result } = renderHook(() => useContratos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar contratos");
  });

  it("should show toast.error when loading templates fails", async () => {
    mockGet.mockResolvedValueOnce([mockContrato]);
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useContratos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar templates");
  });

  it("should poll contratos every 45 seconds", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([mockContrato, mockContrato2]);

    const { result } = renderHook(() => useContratos());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.contratos).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(45000);
    });

    await waitFor(() => expect(result.current.contratos).toHaveLength(2));
    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  // ─────────────────────────────────────────────────────────────
  // createContrato
  // ─────────────────────────────────────────────────────────────

  it("should create a contrato and refresh list", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([mockContrato, mockContrato2]);

    mockPost.mockResolvedValueOnce(mockContrato2);

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1234567890);

    await act(async () => {
      await result.current.createContrato({
        patient_id: "p2",
        titulo: "Contrato de Ortodontia",
        conteudo_html: "<p>Conteúdo</p>",
        valor_contrato: 8000,
        data_inicio: "2024-01-01",
      });
    });

    nowSpy.mockRestore();

    expect(mockPost).toHaveBeenCalledWith("/contratos", {
      patient_id: "p2",
      titulo: "Contrato de Ortodontia",
      conteudo_html: "<p>Conteúdo</p>",
      valor_contrato: 8000,
      data_inicio: "2024-01-01",
      clinic_id: "clinic-1",
      numero_contrato: "CTR-1234567890",
    });
    expect(toast.success).toHaveBeenCalledWith("Contrato criado com sucesso!");
  });

  it("should return null when clinic is null on createContrato", async () => {
    authState.selectedClinic = null;

    const { result } = renderHook(() => useContratos());

    const response = await act(async () => {
      return await result.current.createContrato({
        patient_id: "p1",
        titulo: "Test",
      } as any);
    });

    expect(response).toBeNull();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should show toast.error on createContrato failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockPost.mockRejectedValueOnce(new Error("Save failed"));

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createContrato({
        patient_id: "p1",
        titulo: "Test",
      } as any);
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar contrato");
  });

  // ─────────────────────────────────────────────────────────────
  // createFromTemplate
  // ─────────────────────────────────────────────────────────────

  it("should create a contrato from template", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockGet.mockResolvedValueOnce(mockTemplate);
    mockPost.mockResolvedValueOnce(mockContrato2);

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(9999999999);

    await act(async () => {
      await result.current.createFromTemplate("t1", "p2", "o1");
    });

    nowSpy.mockRestore();

    expect(mockGet).toHaveBeenCalledWith("/contrato-templates/t1");
    expect(mockPost).toHaveBeenCalledWith(
      "/contratos",
      expect.objectContaining({
        patient_id: "p2",
        template_id: "t1",
        orcamento_id: "o1",
        titulo: "Template Padrão",
        valor_contrato: 0,
        data_inicio: expect.any(String),
        clinic_id: "clinic-1",
        numero_contrato: "CTR-9999999999",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("Contrato criado com sucesso!");
  });

  it("should show toast.error on createFromTemplate failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockGet.mockRejectedValueOnce(new Error("Template not found"));

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createFromTemplate("t1", "p2");
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Erro ao criar contrato do template",
    );
  });

  // ─────────────────────────────────────────────────────────────
  // updateContrato
  // ─────────────────────────────────────────────────────────────

  it("should update a contrato and refresh list", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([
        { ...mockContrato, titulo: "Contrato Atualizado" },
      ]);

    mockPut.mockResolvedValueOnce({});

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateContrato("c1", {
        titulo: "Contrato Atualizado",
      });
    });

    expect(mockPut).toHaveBeenCalledWith("/contratos/c1", {
      titulo: "Contrato Atualizado",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Contrato atualizado com sucesso!",
    );
  });

  it("should show toast.error on updateContrato failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockPut.mockRejectedValueOnce(new Error("Update failed"));

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateContrato("c1", { titulo: "Test" });
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar contrato");
  });

  // ─────────────────────────────────────────────────────────────
  // signContrato
  // ─────────────────────────────────────────────────────────────

  it("should sign a contrato and refresh list", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([{ ...mockContrato, status: "ASSINADO" }]);

    mockPut.mockResolvedValueOnce({});

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signContrato(
        "c1",
        "assinatura-paciente",
        "assinatura-dentista",
      );
    });

    expect(mockPut).toHaveBeenCalledWith(
      "/contratos/c1/sign",
      expect.objectContaining({
        status: "ASSINADO",
        assinado_em: expect.any(String),
        assinatura_paciente_base64: "assinatura-paciente",
        assinatura_dentista_base64: "assinatura-dentista",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Contrato assinado com sucesso!",
    );
  });

  it("should show toast.error on signContrato failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockPut.mockRejectedValueOnce(new Error("Sign failed"));

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signContrato("c1", "sig", "sig");
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao assinar contrato");
  });

  // ─────────────────────────────────────────────────────────────
  // cancelContrato
  // ─────────────────────────────────────────────────────────────

  it("should cancel a contrato and refresh list", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([{ ...mockContrato, status: "CANCELADO" }]);

    mockPut.mockResolvedValueOnce({});

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.cancelContrato("c1", "Paciente desistiu");
    });

    expect(mockPut).toHaveBeenCalledWith(
      "/contratos/c1/cancel",
      expect.objectContaining({
        status: "CANCELADO",
        cancelado_em: expect.any(String),
        motivo_cancelamento: "Paciente desistiu",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Contrato cancelado com sucesso!",
    );
  });

  it("should show toast.error on cancelContrato failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockPut.mockRejectedValueOnce(new Error("Cancel failed"));

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.cancelContrato("c1", "Motivo");
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao cancelar contrato");
  });

  // ─────────────────────────────────────────────────────────────
  // createTemplate
  // ─────────────────────────────────────────────────────────────

  it("should create a template and refresh list", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([
        mockTemplate,
        { ...mockTemplate, id: "t2", nome: "Novo Template" },
      ]);

    mockPost.mockResolvedValueOnce({
      ...mockTemplate,
      id: "t2",
      nome: "Novo Template",
    });

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTemplate({
        nome: "Novo Template",
        tipo_tratamento: "Ortodontia",
        conteudo_html: "<p>Novo</p>",
      } as any);
    });

    expect(mockPost).toHaveBeenCalledWith("/contrato-templates", {
      nome: "Novo Template",
      tipo_tratamento: "Ortodontia",
      conteudo_html: "<p>Novo</p>",
      clinic_id: "clinic-1",
    });
    expect(toast.success).toHaveBeenCalledWith("Template criado com sucesso!");
  });

  it("should return null when clinic is null on createTemplate", async () => {
    authState.selectedClinic = null;

    const { result } = renderHook(() => useContratos());

    const response = await act(async () => {
      return await result.current.createTemplate({ nome: "Test" } as any);
    });

    expect(response).toBeNull();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should show toast.error on createTemplate failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockPost.mockRejectedValueOnce(new Error("Save failed"));

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTemplate({ nome: "Test" } as any);
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar template");
  });

  // ─────────────────────────────────────────────────────────────
  // updateTemplate
  // ─────────────────────────────────────────────────────────────

  it("should update a template and refresh list", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([
        { ...mockTemplate, nome: "Template Atualizado" },
      ]);

    mockPut.mockResolvedValueOnce({});

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTemplate("t1", {
        nome: "Template Atualizado",
      });
    });

    expect(mockPut).toHaveBeenCalledWith("/contrato-templates/t1", {
      nome: "Template Atualizado",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Template atualizado com sucesso!",
    );
  });

  it("should show toast.error on updateTemplate failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate]);

    mockPut.mockRejectedValueOnce(new Error("Update failed"));

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTemplate("t1", { nome: "Test" });
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar template");
  });

  // ─────────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────────

  it("should support filtering contratos by status", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato, mockContrato2, mockContrato3])
      .mockResolvedValueOnce([mockTemplate]);

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const assinados = result.current.contratos.filter(
      (c: any) => c.status === "ASSINADO",
    );
    expect(assinados).toHaveLength(1);
    expect(assinados[0].id).toBe("c2");

    const cancelados = result.current.contratos.filter(
      (c: any) => c.status === "CANCELADO",
    );
    expect(cancelados).toHaveLength(1);
    expect(cancelados[0].id).toBe("c3");

    const aguardando = result.current.contratos.filter(
      (c: any) => c.status === "AGUARDANDO_ASSINATURA",
    );
    expect(aguardando).toHaveLength(1);
    expect(aguardando[0].id).toBe("c1");
  });

  it("should support filtering contratos by patient name", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato, mockContrato2, mockContrato3])
      .mockResolvedValueOnce([mockTemplate]);

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const byName = result.current.contratos.filter((c: any) =>
      c.patient_name?.toLowerCase().includes("maria"),
    );
    expect(byName).toHaveLength(1);
    expect(byName[0].patient_name).toBe("Maria Souza");

    const byNamePartial = result.current.contratos.filter((c: any) =>
      c.patient_name?.toLowerCase().includes("silva"),
    );
    expect(byNamePartial).toHaveLength(1);
    expect(byNamePartial[0].patient_name).toBe("João Silva");

    const noMatch = result.current.contratos.filter((c: any) =>
      c.patient_name?.toLowerCase().includes("zzzz"),
    );
    expect(noMatch).toHaveLength(0);
  });

  it("should support filtering contratos by patient_id", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato, mockContrato2])
      .mockResolvedValueOnce([mockTemplate]);

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const byPatientId = result.current.contratos.filter(
      (c: any) => c.patient_id === "p2",
    );
    expect(byPatientId).toHaveLength(1);
    expect(byPatientId[0].id).toBe("c2");
  });

  // ─────────────────────────────────────────────────────────────
  // refreshContratos / refreshTemplates
  // ─────────────────────────────────────────────────────────────

  it("should refresh contratos when refreshContratos is called", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([mockContrato, mockContrato2]);

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refreshContratos();
    });

    expect(mockGet).toHaveBeenCalledTimes(3);
    expect(result.current.contratos).toHaveLength(2);
  });

  it("should refresh templates when refreshTemplates is called", async () => {
    mockGet
      .mockResolvedValueOnce([mockContrato])
      .mockResolvedValueOnce([mockTemplate])
      .mockResolvedValueOnce([mockTemplate, { ...mockTemplate, id: "t2" }]);

    const { result } = renderHook(() => useContratos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refreshTemplates();
    });

    expect(mockGet).toHaveBeenCalledTimes(3);
    expect(result.current.templates).toHaveLength(2);
  });
});
