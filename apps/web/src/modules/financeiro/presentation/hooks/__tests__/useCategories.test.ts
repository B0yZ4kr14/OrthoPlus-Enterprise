import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null } = { clinicId: "clinic-1" };

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

vi.stubGlobal("crypto", {
  randomUUID: () => "test-uuid-456",
});

import { useCategories } from "../useCategories";

const createMockCategoryRow = (overrides: Record<string, unknown> = {}) => ({
  id: "c1",
  clinic_id: "clinic-1",
  name: "Consultas",
  type: "RECEITA",
  color: "#00FF00",
  icon: "stethoscope",
  description: "Receitas com consultas",
  is_active: true,
  created_at: "2024-01-10T00:00:00.000Z",
  updated_at: "2024-01-10T00:00:00.000Z",
  ...overrides,
});

describe("useCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
    authState.clinicId = "clinic-1";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // List categories
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch categories on mount", async () => {
    mockGet.mockResolvedValueOnce([createMockCategoryRow()]);

    const { result } = renderHook(() => useCategories());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe("Consultas");
    expect(result.current.categories[0].type).toBe("RECEITA");
    expect(mockGet).toHaveBeenCalledWith(
      "/financeiro/categories",
      expect.any(Object),
    );
  });

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useCategories());

    // Hook never sets loading to false when clinicId is null (known behavior)
    expect(result.current.loading).toBe(true);
    expect(result.current.categories).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should filter categories by type", async () => {
    mockGet.mockImplementation(
      (url: string, config?: { params?: Record<string, string> }) => {
        if (url === "/financeiro/categories") {
          const params = config?.params || {};
          if (params.type === "DESPESA") {
            return Promise.resolve([
              createMockCategoryRow({
                id: "c2",
                name: "Aluguel",
                type: "DESPESA",
              }),
            ]);
          }
          return Promise.resolve([
            createMockCategoryRow(),
            createMockCategoryRow({
              id: "c2",
              name: "Aluguel",
              type: "DESPESA",
            }),
          ]);
        }
        return Promise.resolve([]);
      },
    );

    const { result } = renderHook(() => useCategories("DESPESA"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].type).toBe("DESPESA");

    const lastCall = mockGet.mock.calls[mockGet.mock.calls.length - 1];
    const params = (lastCall[1] as { params: Record<string, string> })?.params;
    expect(params?.type).toBe("DESPESA");
    expect(params?.is_active).toBe("true");
  });

  // ─────────────────────────────────────────────────────────────
  // Create category
  // ─────────────────────────────────────────────────────────────

  it("should create a category and reload list", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([]); // findByName returns no existing
    mockPost.mockResolvedValueOnce({});
    mockGet.mockResolvedValueOnce([
      createMockCategoryRow({ id: "c-new", name: "Exames", type: "RECEITA" }),
    ]);

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createCategory({
        name: "Exames",
        type: "RECEITA",
        color: "#0000FF",
        icon: "microscope",
      });
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/financeiro/categories",
      expect.objectContaining({
        clinic_id: "clinic-1",
        name: "Exames",
        type: "RECEITA",
        color: "#0000FF",
        icon: "microscope",
        is_active: true,
      }),
    );
    expect(mockGet).toHaveBeenCalledTimes(3);
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe("Exames");
  });

  it("should throw error when creating category without clinicId", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useCategories());

    await expect(
      result.current.createCategory({
        name: "Test",
        type: "RECEITA",
      }),
    ).rejects.toThrow("Usuário não autenticado");
  });

  it("should throw error when category name already exists", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([
      createMockCategoryRow({ name: "Consultas", type: "RECEITA" }),
    ]);

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      result.current.createCategory({
        name: "Consultas",
        type: "RECEITA",
      }),
    ).rejects.toThrow("Já existe uma categoria com este nome");
  });
});
