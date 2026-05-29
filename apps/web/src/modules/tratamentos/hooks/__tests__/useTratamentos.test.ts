import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import "@/infrastructure/di/bootstrap";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
    toasts: [],
  }),
}));

import { container } from "@/infrastructure/di/Container";
import { bootstrapContainer } from "@/infrastructure/di/bootstrap";
import { useTratamentos } from "@/modules/pep/hooks/useTratamentos";

const mockApiRow = {
  id: "t1",
  prontuario_id: "pront-1",
  titulo: "Limpeza",
  descricao: "Limpeza e profilaxia",
  dente_codigo: "18",
  procedimento_id: "proc-1",
  status: "PLANEJADO",
  data_inicio: "2024-01-15",
  data_conclusao: null,
  valor_estimado: 150,
  observacoes: null,
  created_by: "user-1",
  created_at: "2024-01-10T10:00:00Z",
  updated_at: "2024-01-10T10:00:00Z",
};

const mockApiRow2 = {
  ...mockApiRow,
  id: "t2",
  status: "EM_ANDAMENTO",
  titulo: "Restauracao",
  descricao: "Restauracao em resina",
  dente_codigo: "36",
};

const mockApiRow3 = {
  ...mockApiRow,
  id: "t3",
  status: "CONCLUIDO",
  titulo: "Extracao",
  descricao: "Extracao do siso",
  dente_codigo: "48",
  data_conclusao: "2024-03-01",
};

describe("useTratamentos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
    mockToast.mockReset();
    container.clear();
    bootstrapContainer();
  });

  it("should not fetch when prontuarioId is null", async () => {
    const { result } = renderHook(() => useTratamentos(null, "clinic-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tratamentos).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should load tratamentos on mount when prontuarioId is provided", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow, mockApiRow2]);

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tratamentos).toHaveLength(2);
    expect(result.current.tratamentos[0].titulo).toBe("Limpeza");
    expect(result.current.tratamentos[0].status).toBe("PLANEJADO");
    expect(result.current.tratamentos[1].status).toBe("EM_ANDAMENTO");
    expect(mockGet).toHaveBeenCalledWith("/pep/tratamentos", {
      params: { prontuario_id: "pront-1" },
    });
  });

  it("should show toast error when fetching fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro ao carregar tratamentos",
        variant: "destructive",
      }),
    );
  });

  it("should create tratamento and refresh list", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockPost.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([mockApiRow]);

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createTratamento({
        titulo: "Novo Tratamento",
        descricao: "Descricao do tratamento",
        dataInicio: new Date("2024-06-01"),
        createdBy: "user-1",
        denteCodigo: "11",
        valorEstimado: 200,
      });
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/pep/tratamentos",
      expect.objectContaining({
        prontuario_id: "pront-1",
        titulo: "Novo Tratamento",
        descricao: "Descricao do tratamento",
        dente_codigo: "11",
        valor_estimado: 200,
        status: "PLANEJADO",
      }),
    );
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Tratamento criado com sucesso",
      }),
    );
    expect(result.current.tratamentos).toHaveLength(1);
    expect(result.current.tratamentos[0].titulo).toBe("Limpeza");
  });

  it("should show error toast when creating without prontuarioId", async () => {
    const { result } = renderHook(() => useTratamentos(null, "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createTratamento({
        titulo: "Test",
        descricao: "Test desc",
        dataInicio: new Date(),
        createdBy: "user-1",
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro",
        description: "Prontu\u00e1rio n\u00e3o selecionado",
        variant: "destructive",
      }),
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should show error toast when create fails", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockPost.mockRejectedValueOnce(new Error("Save failed"));

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      try {
        await result.current.createTratamento({
          titulo: "Test",
          descricao: "Test desc",
          dataInicio: new Date(),
          createdBy: "user-1",
        });
      } catch {
        // expected
      }
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro ao criar tratamento",
        variant: "destructive",
      }),
    );
  });

  it("should update status to EM_ANDAMENTO and refresh list", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);
    mockGet.mockResolvedValueOnce({ ...mockApiRow });
    mockPatch.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([{ ...mockApiRow, status: "EM_ANDAMENTO" }]);

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tratamentos[0].status).toBe("PLANEJADO");

    await act(async () => {
      await result.current.updateStatus("t1", "iniciar");
    });

    expect(mockGet).toHaveBeenCalledWith("/pep/tratamentos/t1");
    expect(mockPatch).toHaveBeenCalledWith(
      "/pep/tratamentos/t1",
      expect.objectContaining({ status: "EM_ANDAMENTO" }),
    );
    expect(result.current.tratamentos[0].status).toBe("EM_ANDAMENTO");
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Status do tratamento atualizado",
      }),
    );
  });

  it("should update status to CONCLUIDO with valorCobrado", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow2]);
    mockGet.mockResolvedValueOnce({ ...mockApiRow2 });
    mockPatch.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([{ ...mockApiRow2, status: "CONCLUIDO" }]);

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateStatus("t2", "concluir", {
        valorCobrado: 300,
      });
    });

    expect(mockPatch).toHaveBeenCalledWith(
      "/pep/tratamentos/t2",
      expect.objectContaining({ status: "CONCLUIDO" }),
    );
    expect(result.current.tratamentos[0].status).toBe("CONCLUIDO");
  });

  it("should show error toast when updateStatus fails", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);
    mockGet.mockRejectedValueOnce(new Error("Update failed"));

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      try {
        await result.current.updateStatus("t1", "iniciar");
      } catch {
        // expected
      }
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro ao atualizar status",
        variant: "destructive",
      }),
    );
  });

  it("should refresh tratamentos when refresh is called", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([mockApiRow, mockApiRow2, mockApiRow3]);

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tratamentos).toHaveLength(0);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.tratamentos).toHaveLength(3);
    expect(result.current.tratamentos[2].status).toBe("CONCLUIDO");
  });

  it("should return tratamentos that can be filtered by status", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow, mockApiRow2, mockApiRow3]);

    const { result } = renderHook(() => useTratamentos("pront-1", "clinic-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const planejados = result.current.tratamentos.filter(
      (t) => t.status === "PLANEJADO",
    );
    const emAndamento = result.current.tratamentos.filter(
      (t) => t.status === "EM_ANDAMENTO",
    );
    const concluidos = result.current.tratamentos.filter(
      (t) => t.status === "CONCLUIDO",
    );

    expect(planejados).toHaveLength(1);
    expect(planejados[0].titulo).toBe("Limpeza");
    expect(emAndamento).toHaveLength(1);
    expect(emAndamento[0].titulo).toBe("Restauracao");
    expect(concluidos).toHaveLength(1);
    expect(concluidos[0].titulo).toBe("Extracao");
  });
});
