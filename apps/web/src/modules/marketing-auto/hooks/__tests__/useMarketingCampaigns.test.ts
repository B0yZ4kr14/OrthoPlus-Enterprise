import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mutable auth state so individual tests can change clinicId/user
const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
};

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

import { useCampaigns } from "../../presentation/hooks/useCampaigns";

const mockApiRow = {
  id: "c1",
  clinic_id: "clinic-1",
  name: "Campanha de Aniversário",
  description: "Parabéns pelo seu aniversário",
  type: "ANIVERSARIO",
  status: "RASCUNHO",
  message_template: "Olá {{nome}}, feliz aniversário!",
  target_segment: null,
  scheduled_date: null,
  start_date: null,
  end_date: null,
  total_sent: 0,
  total_delivered: 0,
  total_opened: 0,
  total_clicked: 0,
  total_converted: 0,
  total_errors: 0,
  created_by: "user-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockApiRowActive = {
  ...mockApiRow,
  id: "c2",
  name: "Campanha Recall",
  type: "RECALL",
  status: "ATIVA",
  start_date: "2024-01-15T00:00:00Z",
  total_sent: 100,
  total_delivered: 95,
  total_opened: 50,
  total_clicked: 20,
  total_converted: 5,
  total_errors: 5,
};

describe("useCampaigns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
    authState.clinicId = "clinic-1";
    authState.user = { id: "user-1" };
  });

  // ─────────────────────────────────────────────────────────────
  // loadCampaigns
  // ─────────────────────────────────────────────────────────────

  it("should load campaigns on mount", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);

    const { result } = renderHook(() => useCampaigns());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.campaigns).toHaveLength(1);
    expect(result.current.campaigns[0].name).toBe("Campanha de Aniversário");
    expect(result.current.totalCampaigns).toBe(1);
    expect(mockGet).toHaveBeenCalledWith("/marketing/campanhas", {
      params: {},
    });
  });

  it("should keep loading true when clinicId is null", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useCampaigns());

    // When clinicId is null, loadCampaigns returns early without setting loading to false
    expect(result.current.loading).toBe(true);
    expect(result.current.campaigns).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should set error when loading campaigns fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCampaigns());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain("Network error");
  });

  // ─────────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────────

  it("should pass status filter to API", async () => {
    mockGet.mockResolvedValueOnce([mockApiRowActive]);

    const filters = { status: "ATIVA" as const };
    const { result } = renderHook(() => useCampaigns(filters));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith("/marketing/campanhas", {
      params: { status: "ATIVA" },
    });
    expect(result.current.campaigns[0].status).toBe("ATIVA");
  });

  it("should pass type filter to API", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);

    const filters = { type: "ANIVERSARIO" as const };
    const { result } = renderHook(() => useCampaigns(filters));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith("/marketing/campanhas", {
      params: { type: "ANIVERSARIO" },
    });
  });

  it("should pass multiple filters to API", async () => {
    mockGet.mockResolvedValueOnce([]);

    const filters = { status: "ATIVA" as const, type: "RECALL" as const };
    renderHook(() => useCampaigns(filters));

    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    expect(mockGet).toHaveBeenCalledWith("/marketing/campanhas", {
      params: { status: "ATIVA", type: "RECALL" },
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Analytics
  // ─────────────────────────────────────────────────────────────

  it("should compute analytics correctly", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow, mockApiRowActive]);

    const { result } = renderHook(() => useCampaigns());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalCampaigns).toBe(2);
    expect(result.current.activeCampaigns).toBe(1);
    expect(result.current.draftCampaigns).toBe(1);
    expect(result.current.completedCampaigns).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────
  // createCampaign
  // ─────────────────────────────────────────────────────────────

  it("should create a campaign and reload campaigns", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockPost.mockResolvedValueOnce({});

    const { result } = renderHook(() => useCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createCampaign({
        name: "Nova Campanha",
        description: "Descrição",
        type: "RECALL",
        messageTemplate: "Olá {{nome}}",
      });
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/marketing/campanhas",
      expect.objectContaining({
        name: "Nova Campanha",
        type: "RECALL",
      }),
    );
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("should throw error when creating campaign without auth", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useCampaigns());

    await expect(
      result.current.createCampaign({
        name: "Nova Campanha",
        type: "RECALL",
        messageTemplate: "Olá",
      }),
    ).rejects.toThrow("Usuário não autenticado");
  });

  // ─────────────────────────────────────────────────────────────
  // activateCampaign
  // ─────────────────────────────────────────────────────────────

  it("should activate a campaign and reload", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);
    mockGet.mockResolvedValueOnce(mockApiRow);
    mockPatch.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([
      { ...mockApiRow, status: "ATIVA", start_date: "2024-01-15T00:00:00Z" },
    ]);

    const { result } = renderHook(() => useCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.activateCampaign("c1");
    });

    expect(mockPatch).toHaveBeenCalledWith(
      "/marketing/campanhas/c1",
      expect.any(Object),
    );
    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  it("should throw error when activating non-existent campaign", async () => {
    mockGet.mockResolvedValueOnce([mockApiRow]);

    const notFoundError = new Error("Not found") as any;
    notFoundError.response = { status: 404 };
    mockGet.mockRejectedValueOnce(notFoundError);

    const { result } = renderHook(() => useCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.activateCampaign("c999")).rejects.toThrow(
      "Campanha não encontrada",
    );
  });

  // ─────────────────────────────────────────────────────────────
  // pauseCampaign
  // ─────────────────────────────────────────────────────────────

  it("should pause a campaign and reload", async () => {
    mockGet.mockResolvedValueOnce([mockApiRowActive]);
    mockGet.mockResolvedValueOnce(mockApiRowActive);
    mockPatch.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([{ ...mockApiRowActive, status: "PAUSADA" }]);

    const { result } = renderHook(() => useCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.pauseCampaign("c2");
    });

    expect(mockPatch).toHaveBeenCalledWith(
      "/marketing/campanhas/c2",
      expect.any(Object),
    );
    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  // ─────────────────────────────────────────────────────────────
  // completeCampaign
  // ─────────────────────────────────────────────────────────────

  it("should complete a campaign and reload", async () => {
    mockGet.mockResolvedValueOnce([mockApiRowActive]);
    mockGet.mockResolvedValueOnce(mockApiRowActive);
    mockPatch.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([
      {
        ...mockApiRowActive,
        status: "CONCLUIDA",
        end_date: "2024-01-20T00:00:00Z",
      },
    ]);

    const { result } = renderHook(() => useCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.completeCampaign("c2");
    });

    expect(mockPatch).toHaveBeenCalledWith(
      "/marketing/campanhas/c2",
      expect.any(Object),
    );
    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  // ─────────────────────────────────────────────────────────────
  // loadCampaigns reload
  // ─────────────────────────────────────────────────────────────

  it("should reload campaigns when loadCampaigns is called", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([mockApiRow]);

    const { result } = renderHook(() => useCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadCampaigns();
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result.current.campaigns).toHaveLength(1);
  });
});
