import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mutable auth state so individual tests can change clinicId / user
const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
};

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { usePDV } from "@/hooks/usePDV";

const mockCaixaAberto = {
  id: "caixa-1",
  clinic_id: "clinic-1",
  tipo: "ABERTURA" as const,
  valor_informado: 100,
  valor_sistema: 100,
  diferenca: 0,
  observacoes: "",
  aberto_por: "user-1",
  fechado_por: null,
  created_at: "2024-01-15T08:00:00Z",
  created_by: "user-1",
  valor_inicial: 500,
};

const mockVenda = {
  id: "venda-1",
  clinic_id: "clinic-1",
  caixa_id: "caixa-1",
  numero_venda: "V001",
  patient_id: null,
  subtotal: 200,
  desconto: 0,
  valor_total: 200,
  status: "FINALIZADA" as const,
  motivo_cancelamento: null,
  created_by: "user-1",
  created_at: "2024-01-15T09:00:00Z",
  updated_at: "2024-01-15T09:00:00Z",
};

describe("usePDV", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    authState.clinicId = "clinic-1";
    authState.user = { id: "user-1" };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch caixa on mount", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);

    const { result } = renderHook(() => usePDV("clinic-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    expect(result.current.loading).toBe(false);
    expect(mockGet).toHaveBeenCalledWith("/pdv/caixa/aberto");
  });

  it("should remain loading when clinicId is undefined", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => usePDV(undefined));

    // When clinicId is undefined, the effect does not run, so loading stays true
    expect(result.current.loading).toBe(true);
    expect(result.current.caixaAberto).toBeNull();
    expect(result.current.vendas).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should handle null caixa response gracefully", async () => {
    mockGet.mockResolvedValue(null);

    const { result } = renderHook(() => usePDV("clinic-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.caixaAberto).toBeNull();
    expect(result.current.vendas).toHaveLength(0);
  });

  it("should handle errors when loading caixa", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => usePDV("clinic-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.caixaAberto).toBeNull();
    expect(result.current.loading).toBe(false);
    consoleSpy.mockRestore();
  });

  // ─────────────────────────────────────────────────────────────
  // abrirCaixa
  // ─────────────────────────────────────────────────────────────

  it("should open caixa and update state", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    mockPost.mockResolvedValue(mockCaixaAberto);

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.abrirCaixa(500, "Abertura teste");
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/caixa/abrir", {
      valor_inicial: 500,
      observacoes: "Abertura teste",
    });
    expect(result.current.caixaAberto).toEqual(mockCaixaAberto);
  });

  it("should throw error when clinicId is missing on abrirCaixa", async () => {
    authState.clinicId = null;
    mockGet.mockResolvedValue(null);

    const { result } = renderHook(() => usePDV(undefined));

    await expect(result.current.abrirCaixa(500)).rejects.toThrow(
      "Clinic ID required",
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should throw error when user is not authenticated on abrirCaixa", async () => {
    authState.user = null;
    mockGet.mockResolvedValue(null);

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.abrirCaixa(500)).rejects.toThrow(
      "User not authenticated",
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should handle error on abrirCaixa", async () => {
    mockGet.mockResolvedValue(null);
    mockPost.mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.abrirCaixa(500)).rejects.toThrow(
      "Server error",
    );
  });

  // ─────────────────────────────────────────────────────────────
  // fecharCaixa
  // ─────────────────────────────────────────────────────────────

  it("should close caixa and clear state", async () => {
    let shouldReturnNull = false;
    mockGet.mockImplementation(() => {
      return Promise.resolve(shouldReturnNull ? null : mockCaixaAberto);
    });
    mockPost.mockResolvedValue({});

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    shouldReturnNull = true;

    await act(async () => {
      await result.current.fecharCaixa(600, "Fechamento teste");
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/caixa/caixa-1/fechar", {
      valor_final: 600,
      observacoes: "Fechamento teste",
    });
    expect(result.current.caixaAberto).toBeNull();
  });

  it("should throw error when no caixa is open on fecharCaixa", async () => {
    mockGet.mockResolvedValue(null);

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.fecharCaixa(600)).rejects.toThrow(
      "No caixa open",
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should handle error on fecharCaixa", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    mockPost.mockRejectedValue(new Error("Close failed"));

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    await expect(result.current.fecharCaixa(600)).rejects.toThrow(
      "Close failed",
    );
  });

  // ─────────────────────────────────────────────────────────────
  // criarVenda
  // ─────────────────────────────────────────────────────────────

  it("should create venda and reload vendas", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    mockPost.mockResolvedValue({ venda: mockVenda });

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    const vendaData = {
      valor_total: 200,
      desconto: 0,
      status: "FINALIZADA" as const,
    };
    const itens = [
      {
        tipo_item: "SERVICO" as const,
        descricao: "Consulta",
        quantidade: 1,
        valor_unitario: 200,
        desconto: 0,
        valor_total: 200,
      },
    ];
    const pagamentos = [
      {
        forma_pagamento: "DINHEIRO" as const,
        valor: 200,
        parcelas: 1,
      },
    ];

    await act(async () => {
      await result.current.criarVenda(vendaData, itens, pagamentos);
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/caixa/caixa-1/vendas", {
      ...vendaData,
      itens,
      pagamentos,
    });
  });

  it("should throw error when caixa is not open on criarVenda", async () => {
    mockGet.mockResolvedValue(null);

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.criarVenda({}, [], [])).rejects.toThrow(
      "Caixa must be open",
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should throw error when user is not authenticated on criarVenda", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    authState.user = null;

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    await expect(result.current.criarVenda({}, [], [])).rejects.toThrow(
      "User not authenticated",
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should handle error on criarVenda", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    mockPost.mockRejectedValue(new Error("Create failed"));

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    await expect(result.current.criarVenda({}, [], [])).rejects.toThrow(
      "Create failed",
    );
  });

  // ─────────────────────────────────────────────────────────────
  // cancelarVenda
  // ─────────────────────────────────────────────────────────────

  it("should cancel venda and reload vendas", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    mockPost.mockResolvedValue({});

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    await act(async () => {
      await result.current.cancelarVenda("venda-1", "Cancelamento teste");
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/vendas/venda-1/cancelar", {
      motivo_cancelamento: "Cancelamento teste",
    });
  });

  it("should throw error when user is not authenticated on cancelarVenda", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    authState.user = null;

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    await expect(
      result.current.cancelarVenda("venda-1", "motivo"),
    ).rejects.toThrow("User not authenticated");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should handle error on cancelarVenda", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);
    mockPost.mockRejectedValue(new Error("Cancel failed"));

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    await expect(
      result.current.cancelarVenda("venda-1", "motivo"),
    ).rejects.toThrow("Cancel failed");
  });

  // ─────────────────────────────────────────────────────────────
  // reload
  // ─────────────────────────────────────────────────────────────

  it("should reload caixa and vendas when reload is called", async () => {
    mockGet.mockResolvedValue(mockCaixaAberto);

    const { result } = renderHook(() => usePDV("clinic-1"));
    await waitFor(() =>
      expect(result.current.caixaAberto).toEqual(mockCaixaAberto),
    );

    await act(async () => {
      await result.current.reload();
    });

    expect(mockGet).toHaveBeenCalledWith("/pdv/caixa/aberto");
    expect(mockGet).toHaveBeenCalledWith("/pdv/caixa/caixa-1/vendas");
  });
});
