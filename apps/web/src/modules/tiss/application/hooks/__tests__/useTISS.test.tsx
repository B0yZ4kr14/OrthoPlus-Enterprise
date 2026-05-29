import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
};

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

import { useTISS } from "../useTISS";
import { toast } from "sonner";

const mockGuide = {
  id: "g1",
  clinic_id: "clinic-1",
  guide_number: "2025110001",
  patient_id: "p1",
  insurance_company: "Unimed",
  procedure_code: "81000030",
  procedure_name: "Consulta",
  amount: 150,
  status: "pendente" as const,
  service_date: "2025-11-10",
  created_at: "2025-11-10T10:00:00.000Z",
  updated_at: "2025-11-10T10:00:00.000Z",
};

const mockBatch = {
  id: "b1",
  clinic_id: "clinic-1",
  batch_number: "202511001",
  insurance_company: "Unimed",
  total_guides: 5,
  total_amount: 750,
  status: "enviado" as const,
  created_at: "2025-11-10T10:00:00.000Z",
};

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

describe("useTISS", () => {
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

  it("should show loading state and fetch guides/batches on mount", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([mockGuide]);
      if (url === "/tiss/lotes") return Promise.resolve([mockBatch]);
      return Promise.resolve([]);
    });

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.guides).toHaveLength(1);
    expect(result.current.guides[0].guide_number).toBe("2025110001");
    expect(result.current.batches).toHaveLength(1);
    expect(result.current.batches[0].batch_number).toBe("202511001");
    expect(mockGet).toHaveBeenCalledWith("/tiss/guias");
    expect(mockGet).toHaveBeenCalledWith("/tiss/lotes");
  });

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null;

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.guides).toHaveLength(0);
    expect(result.current.batches).toHaveLength(0);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should handle empty guides and batches", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([]);
      if (url === "/tiss/lotes") return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.guides).toHaveLength(0);
    expect(result.current.batches).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // Create guide
  // ─────────────────────────────────────────────────────────────

  it("should create a guide via mutation", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([]);
      if (url === "/tiss/lotes") return Promise.resolve([]);
      return Promise.resolve([]);
    });
    mockPost.mockResolvedValueOnce({ id: "g-new" });

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createGuide({
        patient_id: "p1",
        insurance_company: "Unimed",
        procedure_code: "81000030",
        procedure_name: "Consulta",
        amount: 150,
        service_date: "2025-11-10",
      });
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/tiss/guias",
      expect.objectContaining({
        patient_id: "p1",
        insurance_company: "Unimed",
        procedure_code: "81000030",
        procedure_name: "Consulta",
        amount: 150,
        service_date: "2025-11-10",
        status: "pendente",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("Guia TISS criada!");
  });

  it("should show error toast when createGuide fails", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([]);
      if (url === "/tiss/lotes") return Promise.resolve([]);
      return Promise.resolve([]);
    });
    mockPost.mockRejectedValueOnce(new Error("Save failed"));

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createGuide({
        patient_id: "p1",
        insurance_company: "Unimed",
        procedure_code: "81000030",
        procedure_name: "Consulta",
        amount: 150,
        service_date: "2025-11-10",
      });
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar guia: Save failed");
  });

  it("should set isCreatingGuide while creating", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([]);
      if (url === "/tiss/lotes") return Promise.resolve([]);
      return Promise.resolve([]);
    });
    let resolvePost: (value: unknown) => void;
    mockPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.createGuide({
        patient_id: "p1",
        insurance_company: "Unimed",
        procedure_code: "81000030",
        procedure_name: "Consulta",
        amount: 150,
        service_date: "2025-11-10",
      });
    });

    await waitFor(() => expect(result.current.isCreatingGuide).toBe(true));

    await act(async () => {
      resolvePost!({ id: "g-new" });
    });

    await waitFor(() => expect(result.current.isCreatingGuide).toBe(false));
  });

  // ─────────────────────────────────────────────────────────────
  // Create batch
  // ─────────────────────────────────────────────────────────────

  it("should create a batch via mutation", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([]);
      if (url === "/tiss/lotes") return Promise.resolve([]);
      return Promise.resolve([]);
    });
    mockPost.mockResolvedValueOnce({ id: "b-new" });

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createBatch({
        insurance_company: "Unimed",
        guide_ids: ["g1", "g2"],
      });
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/tiss/lotes",
      expect.objectContaining({
        insurance_company: "Unimed",
        guide_ids: ["g1", "g2"],
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("Lote TISS criado e enviado!");
  });

  it("should show error toast when createBatch fails", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([]);
      if (url === "/tiss/lotes") return Promise.resolve([]);
      return Promise.resolve([]);
    });
    mockPost.mockRejectedValueOnce(new Error("Batch failed"));

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createBatch({
        insurance_company: "Unimed",
        guide_ids: ["g1"],
      });
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Erro ao criar lote: Batch failed",
    );
  });

  it("should set isCreatingBatch while creating", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/guias") return Promise.resolve([]);
      if (url === "/tiss/lotes") return Promise.resolve([]);
      return Promise.resolve([]);
    });
    let resolvePost: (value: unknown) => void;
    mockPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );

    const { result } = renderHook(() => useTISS(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.createBatch({
        insurance_company: "Unimed",
        guide_ids: ["g1"],
      });
    });

    await waitFor(() => expect(result.current.isCreatingBatch).toBe(true));

    await act(async () => {
      resolvePost!({ id: "b-new" });
    });

    await waitFor(() => expect(result.current.isCreatingBatch).toBe(false));
  });
});
