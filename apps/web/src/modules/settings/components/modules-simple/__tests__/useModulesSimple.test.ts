import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const mockPost = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useModulesSimple } from "../useModulesSimple";

const mockModule = {
  id: 1,
  module_key: "PACIENTES",
  name: "Pacientes",
  description: "Gerenciamento de pacientes",
  category: "Atendimento Clínico",
  is_active: true,
  can_activate: true,
  can_deactivate: true,
};

const mockModule2 = {
  id: 2,
  module_key: "FINANCEIRO",
  name: "Financeiro",
  description: "Gestão financeira",
  category: "Gestão Financeira",
  is_active: false,
  can_activate: true,
  can_deactivate: true,
};

describe("useModulesSimple", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockReset();
  });

  // ─────────────────────────────────────────────────────────────
  // Loading state & fetch modules
  // ─────────────────────────────────────────────────────────────

  it("should start with loading true and then fetch modules", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule, mockModule2] });

    const { result } = renderHook(() => useModulesSimple());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.modules).toHaveLength(2);
    expect(result.current.modules[0].name).toBe("Pacientes");
    expect(mockPost).toHaveBeenCalledWith("/modules/my-modules");
  });

  it("should handle empty modules response", async () => {
    mockPost.mockResolvedValueOnce({ modules: [] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.modules).toHaveLength(0);
  });

  it("should handle undefined modules response", async () => {
    mockPost.mockResolvedValueOnce({});

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.modules).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // Toggle module activation
  // ─────────────────────────────────────────────────────────────

  it("should toggle module activation successfully", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });
    mockPost.mockResolvedValueOnce({ cascade_activated: 0 });
    mockPost.mockResolvedValueOnce({
      modules: [{ ...mockModule, is_active: false }],
    });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggle("PACIENTES");
    });

    expect(mockPost).toHaveBeenCalledWith("/modules/toggle", {
      module_key: "PACIENTES",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Módulo atualizado com sucesso!",
    );
  });

  it("should show cascade activation message when dependencies are activated", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });
    mockPost.mockResolvedValueOnce({
      cascade_activated: 2,
      message: "2 módulos dependentes ativados",
    });
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggle("PACIENTES");
    });

    expect(toast.success).toHaveBeenCalledWith(
      "2 módulos dependentes ativados",
    );
  });

  it("should set toggling state during toggle operation", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });
    let resolveToggle: (value: unknown) => void;
    const togglePromise = new Promise((resolve) => {
      resolveToggle = resolve;
    });
    mockPost.mockReturnValueOnce(togglePromise);
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleToggle("PACIENTES");
    });

    expect(result.current.toggling).toBe("PACIENTES");

    await act(async () => {
      resolveToggle!({ cascade_activated: 0 });
      await togglePromise;
    });

    await waitFor(() => expect(result.current.toggling).toBeNull());
  });

  // ─────────────────────────────────────────────────────────────
  // Error handling
  // ─────────────────────────────────────────────────────────────

  it("should show toast.error when fetching modules fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar módulos");
    expect(logger.error).toHaveBeenCalledWith(
      "Erro ao carregar módulos",
      expect.any(Error),
    );
  });

  it("should show toast.error when toggle fails", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });
    mockPost.mockRejectedValueOnce(new Error("Toggle failed"));

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggle("PACIENTES");
    });

    expect(toast.error).toHaveBeenCalledWith("Toggle failed");
    expect(logger.error).toHaveBeenCalledWith(
      "Erro ao alternar módulo",
      expect.any(Error),
      { moduleKey: "PACIENTES" },
    );
  });

  it("should show error message from Error instance when toggle fails", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });
    const customError = new Error("Custom toggle error");
    mockPost.mockRejectedValueOnce(customError);

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggle("PACIENTES");
    });

    expect(toast.error).toHaveBeenCalledWith("Custom toggle error");
  });

  // ─────────────────────────────────────────────────────────────
  // Grouped modules & sorted categories
  // ─────────────────────────────────────────────────────────────

  it("should group modules by category", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule, mockModule2] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.groupedModules["Atendimento Clínico"]).toHaveLength(
      1,
    );
    expect(result.current.groupedModules["Gestão Financeira"]).toHaveLength(1);
  });

  it("should sort categories according to categoryOrder", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule2, mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sortedCategories[0]).toBe("Atendimento Clínico");
    expect(result.current.sortedCategories[1]).toBe("Gestão Financeira");
  });

  // ─────────────────────────────────────────────────────────────
  // UI state handlers
  // ─────────────────────────────────────────────────────────────

  it("should toggle expanded module", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.toggleExpandedModule("PACIENTES");
    });

    expect(result.current.expandedModule).toBe("PACIENTES");

    act(() => {
      result.current.toggleExpandedModule("PACIENTES");
    });

    expect(result.current.expandedModule).toBeNull();
  });

  it("should handle setShowPreview", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setShowPreview(true);
    });

    expect(result.current.showPreview).toBe(true);
  });

  it("should handle setShowWizard", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setShowWizard(true);
    });

    expect(result.current.showWizard).toBe(true);
  });

  it("should handle setShowRoadmap", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setShowRoadmap(true);
    });

    expect(result.current.showRoadmap).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────
  // Roadmap
  // ─────────────────────────────────────────────────────────────

  it("should load roadmap successfully", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });
    const roadmapData = {
      recommendation: ["PACIENTES"],
      clinic_profile: { size: "small" },
    };
    mockPost.mockResolvedValueOnce(roadmapData);

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleLoadRoadmap();
    });

    expect(result.current.roadmapData).toEqual(roadmapData);
    expect(result.current.showRoadmap).toBe(true);
    expect(toast.success).toHaveBeenCalledWith(
      "Roadmap de adoção gerado com sucesso!",
    );
  });

  it("should show toast.error when loading roadmap fails", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });
    mockPost.mockRejectedValueOnce(new Error("Roadmap failed"));

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleLoadRoadmap();
    });

    expect(toast.error).toHaveBeenCalledWith("Roadmap failed");
    expect(logger.error).toHaveBeenCalledWith(
      "Erro ao gerar roadmap",
      expect.any(Error),
    );
  });

  // ─────────────────────────────────────────────────────────────
  // Activate phase
  // ─────────────────────────────────────────────────────────────

  it("should activate modules by phase name matching", async () => {
    const inactiveModule = { ...mockModule, is_active: false };
    mockPost.mockResolvedValueOnce({ modules: [inactiveModule] });
    mockPost.mockResolvedValueOnce({ cascade_activated: 0 });
    mockPost.mockResolvedValueOnce({
      modules: [{ ...inactiveModule, is_active: true }],
    });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleActivatePhase(["Pacientes"]);
    });

    expect(mockPost).toHaveBeenCalledWith("/modules/toggle", {
      module_key: "PACIENTES",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "1 módulo(s) ativado(s) com sucesso!",
    );
  });

  it("should not toggle already active modules in handleActivatePhase", async () => {
    mockPost.mockResolvedValueOnce({ modules: [mockModule] });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleActivatePhase(["Pacientes"]);
    });

    // Only the initial fetch should have been called
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────
  // Wizard activate
  // ─────────────────────────────────────────────────────────────

  it("should activate modules via wizard", async () => {
    const inactiveModule = {
      ...mockModule,
      module_key: "FINANCEIRO",
      name: "Financeiro",
      is_active: false,
    };
    mockPost.mockResolvedValueOnce({ modules: [mockModule, inactiveModule] });
    mockPost.mockResolvedValueOnce({ cascade_activated: 0 });
    mockPost.mockResolvedValueOnce({
      modules: [mockModule, { ...inactiveModule, is_active: true }],
    });

    const { result } = renderHook(() => useModulesSimple());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleWizardActivate(["FINANCEIRO"]);
    });

    expect(mockPost).toHaveBeenCalledWith("/modules/toggle", {
      module_key: "FINANCEIRO",
    });
  });
});
