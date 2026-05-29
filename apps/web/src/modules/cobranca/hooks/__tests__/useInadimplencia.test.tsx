import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const mockGet = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

import { useInadimplencia } from "../useInadimplencia";

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

const mockCobrancaPendente = {
  id: "cob-1",
  paciente_id: "pac-1",
  paciente_nome: "João Silva",
  transacao_financeira_id: "tx-1",
  valor_original: 500,
  valor_pendente: 500,
  data_vencimento: "2025-04-01",
  status: "PENDENTE" as const,
  descricao: "Consulta de rotina",
  telefone: "(11) 98888-7777",
  email: "joao@email.com",
  observacoes: null,
  dias_atraso: 15,
  tentativas_contato: 2,
  ultima_tentativa_contato: "2025-04-10",
  clinic_id: "clinic-1",
  created_at: "2025-04-01T10:00:00",
  updated_at: "2025-04-10T10:00:00",
};

const mockCobrancaCobranca = {
  id: "cob-2",
  paciente_id: "pac-2",
  paciente_nome: "Maria Souza",
  transacao_financeira_id: "tx-2",
  valor_original: 1200,
  valor_pendente: 800,
  data_vencimento: "2025-03-15",
  status: "EM_COBRANCA" as const,
  descricao: "Tratamento ortodôntico",
  telefone: "(11) 97777-6666",
  email: "maria@email.com",
  observacoes: "Segunda tentativa",
  dias_atraso: 35,
  tentativas_contato: 3,
  ultima_tentativa_contato: "2025-04-12",
  clinic_id: "clinic-1",
  created_at: "2025-03-15T10:00:00",
  updated_at: "2025-04-12T10:00:00",
};

const mockCobrancaAcordo = {
  id: "cob-3",
  paciente_id: "pac-3",
  paciente_nome: "Carlos Oliveira",
  transacao_financeira_id: "tx-3",
  valor_original: 2000,
  valor_pendente: 1500,
  data_vencimento: "2025-05-01",
  status: "ACORDO" as const,
  descricao: "Implante",
  telefone: "(11) 96666-5555",
  email: "carlos@email.com",
  observacoes: "Acordo de parcelamento",
  dias_atraso: 0,
  tentativas_contato: 1,
  ultima_tentativa_contato: "2025-04-15",
  clinic_id: "clinic-1",
  created_at: "2025-04-01T10:00:00",
  updated_at: "2025-04-15T10:00:00",
};

describe("useInadimplencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch inadimplentes on mount", async () => {
    mockGet.mockResolvedValueOnce([mockCobrancaPendente]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.inadimplentes).toHaveLength(1);
    expect(result.current.inadimplentes[0].paciente_nome).toBe("João Silva");
    expect(mockGet).toHaveBeenCalledWith("/api/inadimplencia/inadimplentes");
  });

  it("should return empty arrays when no data is returned", async () => {
    mockGet.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.inadimplentes).toHaveLength(0);
    expect(result.current.stats.countTotal).toBe(0);
    expect(result.current.stats.totalEmAberto).toBe(0);
  });

  it("should handle fetch error gracefully", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.inadimplentes).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // Stats computation
  // ─────────────────────────────────────────────────────────────

  it("should compute stats correctly with multiple items", async () => {
    mockGet.mockResolvedValueOnce([
      mockCobrancaPendente,
      mockCobrancaCobranca,
      mockCobrancaAcordo,
    ]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats.totalEmAberto).toBe(2800); // 500 + 800 + 1500
    expect(result.current.stats.totalVencido).toBe(1300); // 500 (PENDENTE) + 800 (EM_COBRANCA)
    expect(result.current.stats.totalAVencer).toBe(1500); // 1500 (ACORDO)
    expect(result.current.stats.countTotal).toBe(3);
    expect(result.current.stats.countVencidos).toBe(2);
    expect(result.current.stats.countAVencer).toBe(1);
    expect(result.current.stats.taxaRecuperacao).toBe(75);
  });

  it("should compute stats correctly with single item", async () => {
    mockGet.mockResolvedValueOnce([mockCobrancaPendente]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats.totalEmAberto).toBe(500);
    expect(result.current.stats.totalVencido).toBe(500);
    expect(result.current.stats.totalAVencer).toBe(0);
    expect(result.current.stats.countTotal).toBe(1);
    expect(result.current.stats.countVencidos).toBe(1);
    expect(result.current.stats.countAVencer).toBe(0);
  });

  it("should handle items with zero or missing valor_pendente", async () => {
    mockGet.mockResolvedValueOnce([
      { ...mockCobrancaPendente, valor_pendente: 0 },
      { ...mockCobrancaCobranca, valor_pendente: undefined as any },
    ]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats.totalEmAberto).toBe(0);
    expect(result.current.stats.totalVencido).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────
  // Refetch
  // ─────────────────────────────────────────────────────────────

  it("should refetch data when refetch is called", async () => {
    mockGet.mockResolvedValueOnce([mockCobrancaPendente]);
    mockGet.mockResolvedValueOnce([mockCobrancaPendente, mockCobrancaCobranca]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.inadimplentes).toHaveLength(1);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.inadimplentes).toHaveLength(2));
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  // ─────────────────────────────────────────────────────────────
  // Data updates (simulating CRUD side-effects via refetch)
  // ─────────────────────────────────────────────────────────────

  it("should reflect updated data after a simulated update via refetch", async () => {
    mockGet.mockResolvedValueOnce([mockCobrancaPendente]);
    const updatedCobranca = { ...mockCobrancaPendente, valor_pendente: 250 };
    mockGet.mockResolvedValueOnce([updatedCobranca]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stats.totalEmAberto).toBe(500);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.stats.totalEmAberto).toBe(250));
  });

  it("should reflect empty state after a simulated delete via refetch", async () => {
    mockGet.mockResolvedValueOnce([mockCobrancaPendente]);
    mockGet.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.inadimplentes).toHaveLength(1);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.inadimplentes).toHaveLength(0));
    expect(result.current.stats.countTotal).toBe(0);
  });

  it("should reflect new item after a simulated create via refetch", async () => {
    mockGet.mockResolvedValueOnce([mockCobrancaPendente]);
    mockGet.mockResolvedValueOnce([mockCobrancaPendente, mockCobrancaCobranca]);

    const { result } = renderHook(() => useInadimplencia(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.inadimplentes).toHaveLength(1);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.inadimplentes).toHaveLength(2));
    expect(result.current.inadimplentes[1].paciente_nome).toBe("Maria Souza");
  });
});
