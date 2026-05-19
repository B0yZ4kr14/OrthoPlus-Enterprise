import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

// Mock DI services
const mockGetLeadsByStatusExecute = vi.fn()
const mockLeadRepoSave = vi.fn()
const mockUpdateLeadStatusExecute = vi.fn()

vi.mock("@/infrastructure/di", () => ({
  useService: vi.fn((key: string) => {
    if (key === "GetLeadsByStatusUseCase") {
      return { execute: mockGetLeadsByStatusExecute }
    }
    if (key === "ILeadRepository") {
      return { save: mockLeadRepoSave }
    }
    if (key === "UpdateLeadStatusUseCase") {
      return { execute: mockUpdateLeadStatusExecute }
    }
    return {}
  }),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.stubGlobal("crypto", {
  randomUUID: () => "test-uuid-123",
})

import { useLeads } from "../useLeads"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockLead = {
  id: "lead-1",
  clinicId: "clinic-1",
  nome: "João Silva",
  email: "joao@example.com",
  telefone: "(11) 98765-4321",
  origem: "SITE" as const,
  status: "NOVO" as const,
  interesseDescricao: "Aparelho ortodôntico",
  valorEstimado: 5000,
  createdAt: new Date("2024-01-15T10:00:00"),
  updatedAt: new Date("2024-01-15T10:00:00"),
}

const mockLead2 = {
  ...mockLead,
  id: "lead-2",
  nome: "Maria Souza",
  status: "QUALIFICADO" as const,
  email: "maria@example.com",
}

describe("useLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetLeadsByStatusExecute.mockReset()
    mockLeadRepoSave.mockReset()
    mockUpdateLeadStatusExecute.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch leads on mount", async () => {
    mockGetLeadsByStatusExecute.mockResolvedValueOnce([mockLead])

    const { result } = renderHook(() => useLeads("clinic-1", "NOVO"), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.leads).toHaveLength(1)
    expect(result.current.leads[0].nome).toBe("João Silva")
    expect(mockGetLeadsByStatusExecute).toHaveBeenCalledWith({
      clinicId: "clinic-1",
      status: "NOVO",
    })
  })

  it("should return empty array when no status is provided", async () => {
    const { result } = renderHook(() => useLeads("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.leads).toHaveLength(0)
    expect(mockGetLeadsByStatusExecute).not.toHaveBeenCalled()
  })

  it("should not fetch when clinicId is empty", async () => {
    const { result } = renderHook(() => useLeads("", "NOVO"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.leads).toHaveLength(0)
    expect(mockGetLeadsByStatusExecute).not.toHaveBeenCalled()
  })

  it("should show error state when fetching fails", async () => {
    mockGetLeadsByStatusExecute.mockRejectedValueOnce(new Error("Erro ao buscar leads"))

    const { result } = renderHook(() => useLeads("clinic-1", "NOVO"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────
  // Create lead
  // ─────────────────────────────────────────────────────────────

  it("should create a lead", async () => {
    mockGetLeadsByStatusExecute.mockResolvedValueOnce([])
    mockLeadRepoSave.mockResolvedValueOnce(mockLead)

    const { result } = renderHook(() => useLeads("clinic-1", "NOVO"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.createLead({
        nome: "João Silva",
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
        origem: "SITE",
        interesseDescricao: "Aparelho ortodôntico",
        valorEstimado: 5000,
      })
    })

    await waitFor(() => expect(result.current.isCreating).toBe(false))

    expect(mockLeadRepoSave).toHaveBeenCalled()
    const savedLead = mockLeadRepoSave.mock.calls[0][0]
    expect(savedLead.nome).toBe("João Silva")
    expect(savedLead.clinicId).toBe("clinic-1")
    expect(savedLead.status).toBe("NOVO")
  })

  it("should show error when creating lead fails", async () => {
    mockGetLeadsByStatusExecute.mockResolvedValueOnce([])
    mockLeadRepoSave.mockRejectedValueOnce(new Error("Erro ao salvar"))

    const { result } = renderHook(() => useLeads("clinic-1", "NOVO"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.createLead({
        nome: "João Silva",
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
        origem: "SITE",
      })
    })

    await waitFor(() => expect(result.current.isCreating).toBe(false))
    expect(mockLeadRepoSave).toHaveBeenCalled()
  })

  // ─────────────────────────────────────────────────────────────
  // Update lead status
  // ─────────────────────────────────────────────────────────────

  it("should update lead status", async () => {
    mockGetLeadsByStatusExecute.mockResolvedValueOnce([mockLead])
    mockUpdateLeadStatusExecute.mockResolvedValueOnce({
      ...mockLead,
      status: "QUALIFICADO",
    })

    const { result } = renderHook(() => useLeads("clinic-1", "NOVO"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.updateStatus({
        leadId: "lead-1",
        newStatus: "QUALIFICADO",
      })
    })

    await waitFor(() => expect(result.current.isUpdating).toBe(false))

    expect(mockUpdateLeadStatusExecute).toHaveBeenCalledWith({
      leadId: "lead-1",
      newStatus: "QUALIFICADO",
    })
  })

  it("should show error when updating status fails", async () => {
    mockGetLeadsByStatusExecute.mockResolvedValueOnce([mockLead])
    mockUpdateLeadStatusExecute.mockRejectedValueOnce(new Error("Erro ao atualizar"))

    const { result } = renderHook(() => useLeads("clinic-1", "NOVO"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.updateStatus({
        leadId: "lead-1",
        newStatus: "QUALIFICADO",
      })
    })

    await waitFor(() => expect(result.current.isUpdating).toBe(false))
    expect(mockUpdateLeadStatusExecute).toHaveBeenCalled()
  })

  // ─────────────────────────────────────────────────────────────
  // Filtering by status
  // ─────────────────────────────────────────────────────────────

  it("should filter leads by different status values", async () => {
    mockGetLeadsByStatusExecute.mockImplementation(
      ({ status }: { status: string }) => {
        if (status === "NOVO") return Promise.resolve([mockLead])
        if (status === "QUALIFICADO") return Promise.resolve([mockLead2])
        return Promise.resolve([])
      },
    )

    const { result, rerender } = renderHook(
      ({ status }: { status: string }) => useLeads("clinic-1", status),
      {
        wrapper: createWrapper(),
        initialProps: { status: "NOVO" },
      },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.leads).toHaveLength(1)
    expect(result.current.leads[0].status).toBe("NOVO")

    rerender({ status: "QUALIFICADO" })

    await waitFor(() => expect(result.current.leads[0]?.status).toBe("QUALIFICADO"))
    expect(result.current.leads).toHaveLength(1)
    expect(result.current.leads[0].nome).toBe("Maria Souza")
  })

  it("should return empty leads for unknown status", async () => {
    mockGetLeadsByStatusExecute.mockResolvedValueOnce([])

    const { result } = renderHook(() => useLeads("clinic-1", "PROPOSTA"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.leads).toHaveLength(0)
    expect(mockGetLeadsByStatusExecute).toHaveBeenCalledWith({
      clinicId: "clinic-1",
      status: "PROPOSTA",
    })
  })
})
