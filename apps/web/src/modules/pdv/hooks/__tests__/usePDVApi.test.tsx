import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { usePDV } from "@/hooks/api/usePDV";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const mockVenda = {
  id: "venda-1",
  clinic_id: "clinic-1",
  valor_total: 200,
  metodo_pagamento: "DINHEIRO",
  status: "FINALIZADA",
  created_at: "2024-01-15T09:00:00Z",
  created_by: "user-1",
};

const mockCaixa = {
  id: "caixa-1",
  tipo: "ABERTURA",
  valor: 500,
  status: "ABERTO",
  aberto_em: "2024-01-15T08:00:00Z",
};

describe("usePDV (api)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state and fetch vendas on mount", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoadingVendas).toBe(true);

    await waitFor(() => expect(result.current.isLoadingVendas).toBe(false));

    expect(result.current.vendas).toHaveLength(1);
    expect(result.current.vendas[0].id).toBe("venda-1");
    expect(mockGet).toHaveBeenCalledWith("/pdv/vendas");
  });

  it("should fetch caixa atual on mount", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoadingCaixa).toBe(true);

    await waitFor(() => expect(result.current.isLoadingCaixa).toBe(false));

    expect(result.current.caixaAtual).toEqual(mockCaixa);
    expect(mockGet).toHaveBeenCalledWith("/pdv/caixa/atual");
  });

  it("should return empty vendas array by default", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce(null);

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingVendas).toBe(false));

    expect(result.current.vendas).toHaveLength(0);
  });

  it("should register venda and invalidate queries", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);
    mockPost.mockResolvedValueOnce(mockVenda);

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingVendas).toBe(false));

    const vendaPayload = {
      valor_total: 200,
      metodo_pagamento: "DINHEIRO",
      items: [
        {
          produto_id: "prod-1",
          quantidade: 1,
          valor_unitario: 200,
        },
      ],
    };

    await act(async () => {
      await result.current.registrarVenda(vendaPayload);
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/vendas", vendaPayload);
  });

  it("should handle error on registrarVenda", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);
    mockPost.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingVendas).toBe(false));

    await act(async () => {
      try {
        await result.current.registrarVenda({
          valor_total: 200,
          metodo_pagamento: "DINHEIRO",
          items: [],
        });
      } catch {
        // expected
      }
    });

    expect(mockPost).toHaveBeenCalled();
  });

  it("should open caixa via mutation", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(null);
    mockPost.mockResolvedValueOnce(mockCaixa);

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingCaixa).toBe(false));

    await act(async () => {
      await result.current.abrirCaixa(500);
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/caixa/abrir", {
      valor_inicial: 500,
    });
  });

  it("should handle error on abrirCaixa", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(null);
    mockPost.mockRejectedValueOnce(new Error("Open failed"));

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingCaixa).toBe(false));

    await act(async () => {
      try {
        await result.current.abrirCaixa(500);
      } catch {
        // expected
      }
    });

    expect(mockPost).toHaveBeenCalled();
  });

  it("should close caixa via mutation", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);
    mockPost.mockResolvedValueOnce({ ...mockCaixa, status: "FECHADO" });

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingCaixa).toBe(false));

    await act(async () => {
      await result.current.fecharCaixa(600);
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/caixa/fechar", {
      valor_final: 600,
    });
  });

  it("should handle error on fecharCaixa", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);
    mockPost.mockRejectedValueOnce(new Error("Close failed"));

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingCaixa).toBe(false));

    await act(async () => {
      try {
        await result.current.fecharCaixa(600);
      } catch {
        // expected
      }
    });

    expect(mockPost).toHaveBeenCalled();
  });

  it("should perform sangria via mutation", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);
    mockPost.mockResolvedValueOnce({ ...mockCaixa, valor: 400 });

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingCaixa).toBe(false));

    await act(async () => {
      await result.current.realizarSangria({
        valor: 100,
        motivo: "Sangria teste",
      });
    });

    expect(mockPost).toHaveBeenCalledWith("/pdv/caixa/sangria", {
      valor: 100,
      motivo: "Sangria teste",
    });
  });

  it("should handle error on realizarSangria", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);
    mockPost.mockRejectedValueOnce(new Error("Sangria failed"));

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingCaixa).toBe(false));

    await act(async () => {
      try {
        await result.current.realizarSangria({ valor: 100, motivo: "teste" });
      } catch {
        // expected
      }
    });

    expect(mockPost).toHaveBeenCalled();
  });

  it("should track isRegistrandoVenda state during mutation", async () => {
    mockGet.mockResolvedValueOnce([mockVenda]);
    mockGet.mockResolvedValueOnce(mockCaixa);
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    mockPost.mockReturnValueOnce(postPromise);

    const { result } = renderHook(() => usePDV(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoadingVendas).toBe(false));

    act(() => {
      result.current.registrarVenda({
        valor_total: 200,
        metodo_pagamento: "DINHEIRO",
        items: [],
      });
    });

    await waitFor(() => expect(result.current.isRegistrandoVenda).toBe(true));

    await act(async () => {
      resolvePost!(mockVenda);
      await postPromise;
    });

    await waitFor(() => expect(result.current.isRegistrandoVenda).toBe(false));
  });
});
