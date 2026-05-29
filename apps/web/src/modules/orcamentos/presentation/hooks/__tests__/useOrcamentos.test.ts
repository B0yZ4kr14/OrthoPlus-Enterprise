import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mutable auth state so individual tests can change it
const authState: {
  clinicId: string | null;
  user: { id: string } | null;
  isPatient: boolean;
} = { clinicId: "clinic-1", user: { id: "user-1" }, isPatient: false };

// API client mocks
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.stubGlobal("crypto", {
  randomUUID: () => "test-uuid-123",
});

import { useOrcamentos } from "../useOrcamentos";

// Use a future date so orcamentos are not expired
const FUTURE_DATE = "2027-06-18T00:00:00.000Z";

function makeApiOrcamento(
  status: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "orc-1",
    numero_orcamento: "ORC-20250519-ABC123",
    clinic_id: "clinic-1",
    patient_id: "patient-1",
    created_by: "user-1",
    titulo: "Tratamento Ortodôntico",
    descricao: "Descrição do tratamento",
    tipo_plano: "PREMIUM",
    validade_dias: 30,
    data_expiracao: FUTURE_DATE,
    status,
    valor_subtotal: 5000,
    desconto_percentual: 10,
    desconto_valor: 500,
    valor_total: 4500,
    observacoes: "Observações",
    aprovado_por: null,
    aprovado_em: null,
    rejeitado_por: null,
    rejeitado_em: null,
    motivo_rejeicao: null,
    convertido_contrato: false,
    contrato_id: null,
    created_at: "2025-05-19T00:00:00.000Z",
    updated_at: "2025-05-19T00:00:00.000Z",
    ...overrides,
  };
}

describe("useOrcamentos (presentation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPut.mockReset();
    authState.clinicId = "clinic-1";
    authState.user = { id: "user-1" };
    authState.isPatient = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should load orcamentos on mount", async () => {
    mockGet.mockResolvedValueOnce([makeApiOrcamento("RASCUNHO")]);

    const { result } = renderHook(() => useOrcamentos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orcamentos).toHaveLength(1);
    expect(result.current.orcamentos[0].titulo).toBe("Tratamento Ortodôntico");
    expect(result.current.orcamentos[0].status).toBe("RASCUNHO");
    expect(result.current.totalOrcamentos).toBe(1);
    expect(result.current.totalValor).toBe(4500);
    expect(mockGet).toHaveBeenCalledWith("/orcamentos", expect.any(Object));
  });

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useOrcamentos());

    // Note: hook initializes loading=true and returns early without setting false.
    // This is the observed production behavior.
    expect(result.current.orcamentos).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should not fetch when user is a patient", async () => {
    authState.isPatient = true;

    const { result } = renderHook(() => useOrcamentos());

    // Note: hook initializes loading=true and returns early without setting false.
    expect(result.current.orcamentos).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // createOrcamento
  // ─────────────────────────────────────────────────────────────

  it("should create an orcamento and reload list", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockPost.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([makeApiOrcamento("RASCUNHO")]);

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createOrcamento({
        patientId: "patient-1",
        titulo: "Novo Orçamento",
        tipoPlano: "BASICO",
        validadeDias: 15,
        valorSubtotal: 3000,
      });
    });

    expect(mockPost).toHaveBeenCalledWith("/orcamentos", expect.any(Object));
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.orcamentos).toHaveLength(1);
  });

  it("should throw error when clinicId is null on create", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useOrcamentos());

    await expect(
      act(async () => {
        await result.current.createOrcamento({
          patientId: "patient-1",
          titulo: "Novo Orçamento",
          tipoPlano: "BASICO",
          validadeDias: 15,
          valorSubtotal: 3000,
        });
      }),
    ).rejects.toThrow("Usuário não autenticado");
  });

  it("should throw error when user is patient on create", async () => {
    authState.isPatient = true;

    const { result } = renderHook(() => useOrcamentos());

    await expect(
      act(async () => {
        await result.current.createOrcamento({
          patientId: "patient-1",
          titulo: "Novo Orçamento",
          tipoPlano: "BASICO",
          validadeDias: 15,
          valorSubtotal: 3000,
        });
      }),
    ).rejects.toThrow("Usuário não autenticado");
  });

  // ─────────────────────────────────────────────────────────────
  // enviarOrcamento
  // ─────────────────────────────────────────────────────────────

  it("should enviar an orcamento and reload list", async () => {
    mockGet.mockResolvedValueOnce([makeApiOrcamento("RASCUNHO")]);
    mockGet.mockResolvedValueOnce(makeApiOrcamento("RASCUNHO"));
    mockPut.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("PENDENTE", { status: "PENDENTE" }),
    ]);

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.enviarOrcamento("orc-1");
    });

    expect(mockGet).toHaveBeenCalledWith("/orcamentos/orc-1");
    expect(mockPut).toHaveBeenCalledWith(
      "/orcamentos/orc-1",
      expect.any(Object),
    );
    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  // ─────────────────────────────────────────────────────────────
  // aprovarOrcamento
  // ─────────────────────────────────────────────────────────────

  it("should aprovar an orcamento and reload list", async () => {
    mockGet.mockResolvedValueOnce([makeApiOrcamento("PENDENTE")]);
    mockGet.mockResolvedValueOnce(makeApiOrcamento("PENDENTE"));
    mockPut.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("APROVADO", { status: "APROVADO" }),
    ]);

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.aprovarOrcamento("orc-1");
    });

    expect(mockGet).toHaveBeenCalledWith("/orcamentos/orc-1");
    expect(mockPut).toHaveBeenCalledWith(
      "/orcamentos/orc-1",
      expect.any(Object),
    );
    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  it("should throw error when user is null on aprovar", async () => {
    authState.user = null;

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.aprovarOrcamento("orc-1");
      }),
    ).rejects.toThrow("Usuário não autenticado");
  });

  // ─────────────────────────────────────────────────────────────
  // Filtering by status and patient
  // ─────────────────────────────────────────────────────────────

  it("should filter orcamentos by status", async () => {
    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("RASCUNHO", { id: "orc-1", titulo: "Rascunho 1" }),
      makeApiOrcamento("PENDENTE", { id: "orc-2", titulo: "Pendente 1" }),
      makeApiOrcamento("APROVADO", { id: "orc-3", titulo: "Aprovado 1" }),
    ]);

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Filtering via loadOrcamentos
    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("PENDENTE", { id: "orc-2", titulo: "Pendente 1" }),
    ]);

    await act(async () => {
      await result.current.loadOrcamentos({ status: "PENDENTE" });
    });

    expect(result.current.orcamentos).toHaveLength(1);
    expect(result.current.orcamentos[0].status).toBe("PENDENTE");
    expect(mockGet).toHaveBeenLastCalledWith("/orcamentos", {
      params: {
        clinic_id: "clinic-1",
        status: "PENDENTE",
        sort: "created_at.desc",
      },
    });
  });

  it("should filter orcamentos by patientId", async () => {
    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("RASCUNHO", { id: "orc-1", patient_id: "patient-1" }),
      makeApiOrcamento("RASCUNHO", { id: "orc-2", patient_id: "patient-2" }),
    ]);

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("RASCUNHO", { id: "orc-2", patient_id: "patient-2" }),
    ]);

    await act(async () => {
      await result.current.loadOrcamentos({ patientId: "patient-2" });
    });

    expect(result.current.orcamentos).toHaveLength(1);
    expect(result.current.orcamentos[0].patientId).toBe("patient-2");
    expect(mockGet).toHaveBeenLastCalledWith("/orcamentos", {
      params: {
        patient_id: "patient-2",
        clinic_id: "clinic-1",
        sort: "created_at.desc",
      },
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Computed analytics
  // ─────────────────────────────────────────────────────────────

  it("should compute orcamentosRascunho, orcamentosPendentes and orcamentosAprovados", async () => {
    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("RASCUNHO", { id: "orc-1", valor_total: 1000 }),
      makeApiOrcamento("RASCUNHO", { id: "orc-2", valor_total: 2000 }),
      makeApiOrcamento("PENDENTE", { id: "orc-3", valor_total: 3000 }),
      makeApiOrcamento("APROVADO", { id: "orc-4", valor_total: 4000 }),
    ]);

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orcamentosRascunho).toHaveLength(2);
    expect(result.current.orcamentosPendentes).toHaveLength(1);
    expect(result.current.orcamentosAprovados).toHaveLength(1);
    expect(result.current.totalValor).toBe(10000);
  });

  it("should reload orcamentos when loadOrcamentos is called", async () => {
    mockGet.mockResolvedValueOnce([makeApiOrcamento("RASCUNHO")]);
    mockGet.mockResolvedValueOnce([
      makeApiOrcamento("PENDENTE", { id: "orc-2" }),
    ]);

    const { result } = renderHook(() => useOrcamentos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadOrcamentos();
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.orcamentos).toHaveLength(1);
    expect(result.current.orcamentos[0].id).toBe("orc-2");
  });
});
