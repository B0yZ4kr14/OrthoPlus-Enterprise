import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockGet = vi.fn();

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

import { usePatientTimeline } from "../usePatientTimeline";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("usePatientTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
  });

  it("should fetch timeline events for a patient", async () => {
    const timelineData = [
      {
        id: "e1",
        type: "appointment" as const,
        title: "Consulta inicial",
        description: "Avaliação ortodôntica",
        date: "2024-03-15T10:00:00Z",
      },
      {
        id: "e2",
        type: "treatment" as const,
        title: "Início do tratamento",
        description: "Colocação de aparelho",
        date: "2024-04-01T14:00:00Z",
      },
    ];

    mockGet.mockResolvedValueOnce({ timeline: timelineData });

    const { result } = renderHook(() => usePatientTimeline("patient-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith("/pacientes/patient-1/timeline");
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].title).toBe("Consulta inicial");
  });

  it("should return undefined data and not fetch when patientId is undefined", async () => {
    const { result } = renderHook(() => usePatientTimeline(undefined), {
      wrapper: createWrapper(),
    });

    // When disabled, query stays pending and data is undefined
    expect(result.current.data).toBeUndefined();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should return empty array when timeline is null", async () => {
    mockGet.mockResolvedValueOnce({ timeline: null });

    const { result } = renderHook(() => usePatientTimeline("patient-2"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it("should handle API errors gracefully", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => usePatientTimeline("patient-3"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it("should not fetch when patientId is empty string", async () => {
    const { result } = renderHook(() => usePatientTimeline(""), {
      wrapper: createWrapper(),
    });

    // Query is disabled for empty string, so it stays in idle/pending state
    // but data should be undefined and no API call made
    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
