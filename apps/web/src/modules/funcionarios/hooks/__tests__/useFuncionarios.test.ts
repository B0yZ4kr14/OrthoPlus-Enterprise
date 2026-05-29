import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null } = { clinicId: "clinic-1" };

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

import { toast } from "sonner";
import { useFuncionarios } from "../useFuncionarios";

const mockApiRow = {
  id: "f1",
  clinic_id: "clinic-1",
  nome: "João Silva",
  cpf: "111.222.333-44",
  rg: "11.222.333-4",
  data_nascimento: "1988-06-10",
  sexo: "M",
  telefone: "(11) 3456-7890",
  celular: "(11) 98888-7777",
  email: "joao@clinica.com",
  endereco: {
    cep: "01234-567",
    logradouro: "Rua A",
    numero: "100",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
  },
  cargo: "Administrador",
  data_admissao: "2020-01-15",
  salario: 5000,
  permissoes: { pacientes: ["visualizar"] },
  horario_trabalho: { inicio: "08:00", fim: "18:00" },
  dias_trabalho: [1, 2, 3, 4, 5],
  observacoes: null,
  status: "Ativo",
  user_id: null,
  avatar_url: null,
  created_at: "2020-01-15T10:00:00",
  updated_at: "2020-01-15T10:00:00",
};

const mockApiRow2 = {
  ...mockApiRow,
  id: "f2",
  nome: "Maria Souza",
  cpf: "222.333.444-55",
  email: "maria@clinica.com",
  cargo: "Recepcionista",
  status: "Inativo",
};

describe("useFuncionarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
    authState.clinicId = "clinic-1";
  });

  // ─────────────────────────────────────────────────────────────
  // loadFuncionarios
  // ─────────────────────────────────────────────────────────────

  it("should load funcionarios on mount", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);

    const { result } = renderHook(() => useFuncionarios());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.funcionarios).toHaveLength(1);
    expect(result.current.funcionarios[0].nome).toBe("João Silva");
    expect(result.current.funcionarios[0].cpf).toBe("111.222.333-44");
    expect(mockGet).toHaveBeenCalledWith("/funcionarios");
  });

  it("should set loading to false when clinicId is null", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useFuncionarios());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.funcionarios).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should show toast.error when loading funcionarios fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useFuncionarios());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar funcionários");
  });

  // ─────────────────────────────────────────────────────────────
  // addFuncionario
  // ─────────────────────────────────────────────────────────────

  it("should add a funcionario and update state", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockPost.mockResolvedValueOnce(mockApiRow);

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const newFuncionario = {
      id: "",
      nome: "João Silva",
      cpf: "111.222.333-44",
      dataNascimento: "1988-06-10",
      sexo: "M" as const,
      telefone: "(11) 3456-7890",
      celular: "(11) 98888-7777",
      email: "joao@clinica.com",
      endereco: {
        cep: "01234-567",
        logradouro: "Rua A",
        numero: "100",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
      },
      cargo: "Administrador" as const,
      dataAdmissao: "2020-01-15",
      salario: 5000,
      permissoes: { pacientes: ["visualizar"] },
      horarioTrabalho: { inicio: "08:00", fim: "18:00" },
      diasTrabalho: [1, 2, 3, 4, 5],
      status: "Ativo" as const,
    };

    await act(async () => {
      await result.current.addFuncionario(newFuncionario as any);
    });

    expect(mockPost).toHaveBeenCalledWith("/funcionarios", expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith(
      "Funcionário cadastrado com sucesso!",
    );
    expect(result.current.funcionarios).toHaveLength(1);
  });

  it("should show toast.error when clinicId is null on addFuncionario", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addFuncionario({ nome: "Test" } as any);
    });

    expect(toast.error).toHaveBeenCalledWith("Clínica não identificada");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should show toast.error on addFuncionario failure", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockPost.mockRejectedValueOnce(new Error("Save failed"));

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addFuncionario({ nome: "Test" } as any);
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao cadastrar funcionário");
  });

  it("should show CPF duplicate error when error code is 23505", async () => {
    mockGet.mockResolvedValueOnce([]);
    const error = new Error("duplicate");
    (error as any).code = "23505";
    mockPost.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addFuncionario({ nome: "Test" } as any);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "CPF já cadastrado para esta clínica",
    );
  });

  // ─────────────────────────────────────────────────────────────
  // updateFuncionario
  // ─────────────────────────────────────────────────────────────

  it("should update a funcionario and update state", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);
    mockPatch.mockResolvedValueOnce({
      ...mockApiRow,
      nome: "João Silva Atualizado",
    });

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = {
      ...result.current.funcionarios[0],
      nome: "João Silva Atualizado",
    };

    await act(async () => {
      await result.current.updateFuncionario("f1", updated);
    });

    expect(mockPatch).toHaveBeenCalledWith(
      "/funcionarios/f1",
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Funcionário atualizado com sucesso!",
    );
    expect(result.current.funcionarios[0].nome).toBe("João Silva Atualizado");
  });

  it("should show toast.error when clinicId is null on updateFuncionario", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateFuncionario("f1", { nome: "Test" } as any);
    });

    expect(toast.error).toHaveBeenCalledWith("Clínica não identificada");
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it("should show toast.error on updateFuncionario failure", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);
    mockPatch.mockRejectedValueOnce(new Error("Update failed"));

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateFuncionario("f1", { nome: "Test" } as any);
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar funcionário");
  });

  // ─────────────────────────────────────────────────────────────
  // deleteFuncionario
  // ─────────────────────────────────────────────────────────────

  it("should delete a funcionario and update state", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);
    mockDelete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteFuncionario("f1");
    });

    expect(mockDelete).toHaveBeenCalledWith("/funcionarios/f1");
    expect(toast.success).toHaveBeenCalledWith(
      "Funcionário removido com sucesso!",
    );
    expect(result.current.funcionarios).toHaveLength(0);
  });

  it("should show toast.error when clinicId is null on deleteFuncionario", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteFuncionario("f1");
    });

    expect(toast.error).toHaveBeenCalledWith("Clínica não identificada");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("should show toast.error on deleteFuncionario failure", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);
    mockDelete.mockRejectedValueOnce(new Error("Delete failed"));

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteFuncionario("f1");
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao remover funcionário");
  });

  // ─────────────────────────────────────────────────────────────
  // filterFuncionarios
  // ─────────────────────────────────────────────────────────────

  it("should filter funcionarios by search, status and cargo", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow, mockApiRow2]);

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const filteredBySearch = result.current.filterFuncionarios({
      search: "Maria",
    });
    expect(filteredBySearch).toHaveLength(1);
    expect(filteredBySearch[0].nome).toBe("Maria Souza");

    const filteredByStatus = result.current.filterFuncionarios({
      status: "Ativo",
    });
    expect(filteredByStatus).toHaveLength(1);
    expect(filteredByStatus[0].nome).toBe("João Silva");

    const filteredByCargo = result.current.filterFuncionarios({
      cargo: "Recepcionista",
    });
    expect(filteredByCargo).toHaveLength(1);
    expect(filteredByCargo[0].nome).toBe("Maria Souza");

    const noMatch = result.current.filterFuncionarios({ search: "zzz" });
    expect(noMatch).toHaveLength(0);

    const allMatch = result.current.filterFuncionarios({});
    expect(allMatch).toHaveLength(2);
  });

  it("should filter funcionarios by CPF and email search", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow, mockApiRow2]);

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const byCpf = result.current.filterFuncionarios({
      search: "222.333.444-55",
    });
    expect(byCpf).toHaveLength(1);
    expect(byCpf[0].nome).toBe("Maria Souza");

    const byEmail = result.current.filterFuncionarios({
      search: "joao@clinica.com",
    });
    expect(byEmail).toHaveLength(1);
    expect(byEmail[0].nome).toBe("João Silva");
  });

  // ─────────────────────────────────────────────────────────────
  // reloadFuncionarios
  // ─────────────────────────────────────────────────────────────

  it("should reload funcionarios when reloadFuncionarios is called", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([mockApiRow]);

    const { result } = renderHook(() => useFuncionarios());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.reloadFuncionarios();
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.funcionarios).toHaveLength(1);
    expect(result.current.funcionarios[0].nome).toBe("João Silva");
  });
});
