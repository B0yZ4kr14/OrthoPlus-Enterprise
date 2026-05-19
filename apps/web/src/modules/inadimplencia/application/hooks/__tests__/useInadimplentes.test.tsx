import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null } = { clinicId: "clinic-1" }

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockGet = vi.fn()
const mockPost = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

import { toast } from "sonner"
import { useInadimplentes } from "../useInadimplentes"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockInadimplente = {
  id: "ind-1",
  clinic_id: "clinic-1",
  paciente_id: "pac-1",
  paciente: { nome: "João Silva" },
  valor_total_devido: 1850,
  dias_atraso: 15,
  ultimo_contato: "2025-11-10",
  status: "em_negociacao",
  created_at: "2025-11-01T10:00:00",
  updated_at: "2025-11-10T10:00:00",
}

const mockInadimplente2 = {
  id: "ind-2",
  clinic_id: "clinic-1",
  paciente_id: "pac-2",
  paciente: { nome: "Maria Santos" },
  valor_total_devido: 3200,
  dias_atraso: 45,
  ultimo_contato: "2025-11-01",
  status: "critico",
  created_at: "2025-10-15T10:00:00",
  updated_at: "2025-11-01T10:00:00",
}

const mockCampanha = {
  id: "camp-1",
  clinic_id: "clinic-1",
  inadimplente_id: "ind-1",
  tipo_campanha: "WHATSAPP",
  status: "ATIVA",
  created_at: "2025-11-10T10:00:00",
}

describe("useInadimplentes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    authState.clinicId = "clinic-1"
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch inadimplentes on mount", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/inadimplentes") return Promise.resolve([mockInadimplente])
      if (url === "/campanhas-inadimplencia") return Promise.resolve([mockCampanha])
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useInadimplentes(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.inadimplentes).toHaveLength(1)
    expect(result.current.inadimplentes[0].id).toBe("ind-1")
    expect(result.current.campanhas).toHaveLength(1)
    expect(result.current.campanhas[0].id).toBe("camp-1")
    expect(mockGet).toHaveBeenCalledWith("/inadimplentes", {
      params: { clinic_id: "clinic-1", sort: "valor_total_devido.desc" },
    })
    expect(mockGet).toHaveBeenCalledWith("/campanhas-inadimplencia", {
      params: { clinic_id: "clinic-1", sort: "created_at.desc" },
    })
  })

  it("should return empty arrays and not fetch when clinicId is null", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => useInadimplentes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.inadimplentes).toHaveLength(0)
    expect(result.current.campanhas).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  // ─────────────────────────────────────────────────────────────
  // iniciarCobranca mutation (CRUD)
  // ─────────────────────────────────────────────────────────────

  it("should iniciar cobranca and invalidate queries on success", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/inadimplentes") return Promise.resolve([mockInadimplente])
      if (url === "/campanhas-inadimplencia") return Promise.resolve([mockCampanha])
      return Promise.resolve([])
    })
    mockPost.mockResolvedValueOnce({ id: "camp-2", status: "ATIVA" })

    const { result } = renderHook(() => useInadimplentes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.iniciarCobranca({ inadimplenteId: "ind-1", tipo: "SMS" })
    })

    await waitFor(() => expect(mockPost).toHaveBeenCalled())

    expect(mockPost).toHaveBeenCalledWith("/campanhas-inadimplencia", {
      clinic_id: "clinic-1",
      inadimplente_id: "ind-1",
      tipo_campanha: "SMS",
      status: "ATIVA",
    })
    expect(toast.success).toHaveBeenCalledWith("Cobrança iniciada!")
  })

  it("should show toast.error when iniciarCobranca fails", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/inadimplentes") return Promise.resolve([mockInadimplente])
      if (url === "/campanhas-inadimplencia") return Promise.resolve([mockCampanha])
      return Promise.resolve([])
    })
    mockPost.mockRejectedValueOnce(new Error("Failed"))

    const { result } = renderHook(() => useInadimplentes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.iniciarCobranca({ inadimplenteId: "ind-1", tipo: "WHATSAPP" })
    })

    await waitFor(() => expect(mockPost).toHaveBeenCalled())

    expect(toast.error).toHaveBeenCalledWith("Erro ao iniciar cobrança")
  })

  // ─────────────────────────────────────────────────────────────
  // Filtering / derived data
  // ─────────────────────────────────────────────────────────────

  it("should reflect isLoading while both queries are loading", async () => {
    let resolveInadimplentes: (value: any[]) => void = () => {}
    let resolveCampanhas: (value: any[]) => void = () => {}

    mockGet.mockImplementation((url: string) => {
      if (url === "/inadimplentes") {
        return new Promise((resolve) => { resolveInadimplentes = resolve })
      }
      if (url === "/campanhas-inadimplencia") {
        return new Promise((resolve) => { resolveCampanhas = resolve })
      }
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useInadimplentes(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    resolveInadimplentes([mockInadimplente])
    await waitFor(() => expect(result.current.inadimplentes).toHaveLength(1))

    // Still loading because campanhas query is still pending
    expect(result.current.isLoading).toBe(true)

    resolveCampanhas([mockCampanha])
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.campanhas).toHaveLength(1)
  })

  it("should return multiple inadimplentes and campanhas", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/inadimplentes") return Promise.resolve([mockInadimplente, mockInadimplente2])
      if (url === "/campanhas-inadimplencia") return Promise.resolve([mockCampanha])
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useInadimplentes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.inadimplentes).toHaveLength(2)
    expect(result.current.inadimplentes[1].paciente.nome).toBe("Maria Santos")
    expect(result.current.campanhas).toHaveLength(1)
  })
})
