import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const authState: { clinicId: string | null } = { clinicId: "clinic-1" }

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

import { useTeleconsultas } from "../useTeleconsultas"
import { toast } from "sonner"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockTeleconsulta = {
  id: "tc-1",
  clinic_id: "clinic-1",
  patient_id: "patient-1",
  dentist_id: "dentist-1",
  titulo: "Consulta Teste",
  tipo: "VIDEO",
  status: "AGENDADA",
  data_agendada: "2025-06-15T14:00:00",
  motivo: "Dor de dente",
}

const mockTeleconsulta2 = {
  ...mockTeleconsulta,
  id: "tc-2",
  titulo: "Retorno Teste",
  tipo: "AUDIO",
  status: "CONCLUIDA",
}

describe("useTeleconsultas", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    authState.clinicId = "clinic-1"
    // Default return so background refetches after invalidateQueries don't warn
    mockGet.mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch teleconsultas on mount", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])

    const { result } = renderHook(() => useTeleconsultas(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.teleconsultas).toHaveLength(1)
    expect(result.current.teleconsultas[0].titulo).toBe("Consulta Teste")
    expect(mockGet).toHaveBeenCalledWith("/teleodonto/teleconsultas")
  })

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => useTeleconsultas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.teleconsultas).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should fetch multiple teleconsultas", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta, mockTeleconsulta2])

    const { result } = renderHook(() => useTeleconsultas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.teleconsultas).toHaveLength(2)
    expect(result.current.teleconsultas[1].titulo).toBe("Retorno Teste")
  })

  // ─────────────────────────────────────────────────────────────
  // Create teleconsulta
  // ─────────────────────────────────────────────────────────────

  it("should create a teleconsulta and show success toast", async () => {
    mockGet.mockResolvedValueOnce([])
    mockPost.mockResolvedValueOnce({ id: "tc-new", titulo: "Nova Consulta" })

    const { result } = renderHook(() => useTeleconsultas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.createTeleconsulta({
        titulo: "Nova Consulta",
        tipo: "VIDEO",
        motivo: "Teste",
      } as any)
    })

    await waitFor(() => expect(mockPost).toHaveBeenCalled())

    expect(mockPost).toHaveBeenCalledWith(
      "/teleodonto/teleconsultas",
      expect.any(Object),
    )
    expect(toast.success).toHaveBeenCalledWith(
      "Teleconsulta agendada com sucesso!",
    )
  })

  it("should show error toast when creating teleconsulta fails", async () => {
    mockGet.mockResolvedValueOnce([])
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useTeleconsultas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.createTeleconsulta({
        titulo: "Falha",
        tipo: "VIDEO",
        motivo: "Teste",
      } as any)
    })

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Erro ao agendar teleconsulta"),
    )

    expect(mockPost).toHaveBeenCalledWith(
      "/teleodonto/teleconsultas",
      expect.any(Object),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // Update status
  // ─────────────────────────────────────────────────────────────

  it("should update teleconsulta status and show success toast", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockPatch.mockResolvedValueOnce({ ...mockTeleconsulta, status: "CONCLUIDA" })

    const { result } = renderHook(() => useTeleconsultas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateStatus({ id: "tc-1", status: "CONCLUIDA" })
    })

    await waitFor(() => expect(mockPatch).toHaveBeenCalled())

    expect(mockPatch).toHaveBeenCalledWith("/teleodonto/teleconsultas/tc-1", {
      status: "CONCLUIDA",
    })
    expect(toast.success).toHaveBeenCalledWith("Status atualizado!")
  })

  it("should handle update status error gracefully", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockPatch.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => useTeleconsultas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateStatus({ id: "tc-1", status: "CANCELADA" })
    })

    await waitFor(() => expect(mockPatch).toHaveBeenCalled())

    expect(mockPatch).toHaveBeenCalledWith("/teleodonto/teleconsultas/tc-1", {
      status: "CANCELADA",
    })
  })
})
