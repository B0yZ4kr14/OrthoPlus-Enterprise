import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mutable auth state so individual tests can change clinicId/user
const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
};

const mockToast = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}));

import { useRadiografia } from "../useRadiografia";
import type { AnaliseComplete } from "../../types/radiografia.types";

const mockAnalise: AnaliseComplete = {
  id: "analise-1",
  clinic_id: "clinic-1",
  paciente_id: "patient-1",
  tipo_radiografia: "PANORAMICA",
  imagem_url: "https://example.com/img1.jpg",
  imagem_storage_path: "/path/img1.jpg",
  status: "CONCLUIDA",
  revisada: false,
  paciente_name: "João Silva",
  problemas_detectados: 3,
  confidence_score: 87,
  created_at: "2024-01-15T10:00:00Z",
  resultado_ia: {
    problemas_detectados: [
      {
        tipo_problema: "CARIE",
        localizacao: "Dente 14",
        severidade: "MODERADA",
      } as any,
    ],
    sugestoes_tratamento: [],
    observacoes_ia: "Cáries detectadas",
  },
};

const mockAnalise2: AnaliseComplete = {
  id: "analise-2",
  clinic_id: "clinic-1",
  paciente_id: "patient-1",
  tipo_radiografia: "PERIAPICAL",
  imagem_url: "https://example.com/img2.jpg",
  imagem_storage_path: "/path/img2.jpg",
  status: "PROCESSANDO",
  revisada: false,
  paciente_name: "João Silva",
  problemas_detectados: 1,
  confidence_score: 92,
  created_at: "2024-01-20T10:00:00Z",
};

describe("useRadiografia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    authState.clinicId = "clinic-1";
    authState.user = { id: "user-1" };
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─────────────────────────────────────────────────────────────
  // loadData / initial fetch
  // ─────────────────────────────────────────────────────────────

  it("should load analises on mount", async () => {
    mockGet.mockResolvedValue([mockAnalise, mockAnalise2]);

    const { result } = renderHook(() => useRadiografia());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.analises).toHaveLength(2);
    expect(result.current.analises[0].paciente_name).toBe("João Silva");
    expect(mockGet).toHaveBeenCalledWith("/ia-radiografia/analises");
  });

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useRadiografia());

    // When clinicId is null, useEffect does not run loadData, so loading stays true
    expect(result.current.loading).toBe(true);
    expect(result.current.analises).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should show toast error when loading analises fails", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useRadiografia());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro ao carregar análises",
        variant: "destructive",
      }),
    );
  });

  it("should set up polling interval", async () => {
    mockGet.mockResolvedValue([mockAnalise]);
    const setIntervalSpy = vi.spyOn(global, "setInterval");

    renderHook(() => useRadiografia());

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));

    expect(setIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
  });

  // ─────────────────────────────────────────────────────────────
  // uploadRadiografia
  // ─────────────────────────────────────────────────────────────

  it("should upload radiografia and reload data", async () => {
    mockGet.mockResolvedValue([]);
    mockPost.mockResolvedValue({ id: "new-analise" });

    const { result } = renderHook(() => useRadiografia());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(["dummy"], "xray.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadRadiografia(
        "patient-1",
        undefined,
        "PANORAMICA",
        file,
      );
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/ia-radiografia/upload-e-analisar",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Radiografia enviada",
      }),
    );
  });

  it("should throw error when user is not authenticated on upload", async () => {
    mockGet.mockResolvedValue([]);
    authState.user = null;

    const { result } = renderHook(() => useRadiografia());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(["dummy"], "xray.jpg", { type: "image/jpeg" });

    await act(async () => {
      await expect(
        result.current.uploadRadiografia(
          "patient-1",
          undefined,
          "PANORAMICA",
          file,
        ),
      ).rejects.toThrow("Usuário não autenticado");
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should throw error when clinicId is null on upload", async () => {
    mockGet.mockResolvedValue([]);
    authState.clinicId = null;

    const { result } = renderHook(() => useRadiografia());

    const file = new File(["dummy"], "xray.jpg", { type: "image/jpeg" });

    await act(async () => {
      await expect(
        result.current.uploadRadiografia(
          "patient-1",
          undefined,
          "PANORAMICA",
          file,
        ),
      ).rejects.toThrow("Clínica não encontrada");
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should show toast error on upload failure", async () => {
    mockGet.mockResolvedValue([]);
    mockPost.mockRejectedValue(new Error("Upload failed"));

    const { result } = renderHook(() => useRadiografia());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(["dummy"], "xray.jpg", { type: "image/jpeg" });

    await act(async () => {
      await expect(
        result.current.uploadRadiografia(
          "patient-1",
          undefined,
          "PANORAMICA",
          file,
        ),
      ).rejects.toThrow("Upload failed");
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro ao fazer upload",
        variant: "destructive",
      }),
    );
  });

  it("should include prontuario_id in form data when provided", async () => {
    mockGet.mockResolvedValue([]);
    mockPost.mockResolvedValue({ id: "new-analise" });

    const { result } = renderHook(() => useRadiografia());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(["dummy"], "xray.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadRadiografia(
        "patient-1",
        "pront-1",
        "PANORAMICA",
        file,
      );
    });

    const postCall = mockPost.mock.calls[0];
    const formData = postCall[1] as FormData;
    expect(formData.get("prontuario_id")).toBe("pront-1");
  });

  // ─────────────────────────────────────────────────────────────
  // marcarComoRevisado
  // ─────────────────────────────────────────────────────────────

  it("should marcar como revisado and reload data", async () => {
    mockGet.mockResolvedValue([mockAnalise]);
    mockPatch.mockResolvedValue({});

    const { result } = renderHook(() => useRadiografia());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.marcarComoRevisado(
        "analise-1",
        "Revisado pelo dentista",
      );
    });

    expect(mockPatch).toHaveBeenCalledWith(
      "/ia-radiografia/analises/analise-1/revisar",
      expect.objectContaining({
        observacoes_dentista: "Revisado pelo dentista",
        assinatura_digital: expect.stringContaining("user-1:analise-1:"),
      }),
    );
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Análise revisada",
      }),
    );
  });

  it("should show toast error on marcarComoRevisado failure", async () => {
    mockGet.mockResolvedValue([mockAnalise]);
    mockPatch.mockRejectedValue(new Error("Patch failed"));

    const { result } = renderHook(() => useRadiografia());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.marcarComoRevisado("analise-1", "obs");
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro ao salvar revisão",
        variant: "destructive",
      }),
    );
  });

  // ─────────────────────────────────────────────────────────────
  // reloadData
  // ─────────────────────────────────────────────────────────────

  it("should reload data when reloadData is called", async () => {
    mockGet.mockResolvedValue([]);

    const { result } = renderHook(() => useRadiografia());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Reset call count after initial load
    mockGet.mockClear();

    await act(async () => {
      await result.current.reloadData();
    });

    expect(mockGet).toHaveBeenCalledWith("/ia-radiografia/analises");
  });
});
