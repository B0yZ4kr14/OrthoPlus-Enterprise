import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { usePacienteConvenios } from "../usePacienteConvenios";

const mockVinculo = {
  id: "v1",
  clinic_id: "clinic-1",
  patient_id: "p1",
  convenio_id: "c1",
  numero_carteira: "123456",
  validade_carteira: "2026-12-31",
  is_active: true,
  created_at: "2026-05-27T10:00:00.000Z",
  updated_at: "2026-05-27T10:00:00.000Z",
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

describe("usePacienteConvenios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch vinculos for a patient", async () => {
    mockGet.mockResolvedValueOnce([mockVinculo]);

    const { result } = renderHook(() => usePacienteConvenios("p1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledWith(
      "/tiss/paciente-convenios?patient_id=p1",
    );
    expect(result.current.vinculos).toHaveLength(1);
    expect(result.current.vinculos[0].id).toBe("v1");
  });

  it("should not fetch when patientId is undefined", () => {
    const { result } = renderHook(() => usePacienteConvenios(undefined), {
      wrapper: createWrapper(),
    });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("should create a vinculo", async () => {
    mockGet.mockResolvedValueOnce([]);
    mockPost.mockResolvedValueOnce(mockVinculo);

    const { result } = renderHook(() => usePacienteConvenios("p1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.createVinculo({
        patient_id: "p1",
        convenio_id: "c1",
        numero_carteira: "123456",
      });
    });

    await waitFor(() => expect(result.current.isCreating).toBe(false));

    expect(mockPost).toHaveBeenCalledWith("/tiss/paciente-convenios", {
      patient_id: "p1",
      convenio_id: "c1",
      numero_carteira: "123456",
    });
  });

  it("should update a vinculo", async () => {
    mockGet.mockResolvedValueOnce([mockVinculo]);
    mockPatch.mockResolvedValueOnce({ ...mockVinculo, numero_carteira: "999" });

    const { result } = renderHook(() => usePacienteConvenios("p1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateVinculo({
        id: "v1",
        data: { numero_carteira: "999" },
      });
    });

    await waitFor(() => expect(result.current.isUpdating).toBe(false));

    expect(mockPatch).toHaveBeenCalledWith("/tiss/paciente-convenios/v1", {
      numero_carteira: "999",
    });
  });

  it("should delete a vinculo", async () => {
    mockGet.mockResolvedValueOnce([mockVinculo]);
    mockDelete.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => usePacienteConvenios("p1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.deleteVinculo("v1");
    });

    await waitFor(() => expect(result.current.isDeleting).toBe(false));

    expect(mockDelete).toHaveBeenCalledWith("/tiss/paciente-convenios/v1");
  });
});
