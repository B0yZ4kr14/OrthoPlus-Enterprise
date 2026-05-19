import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
}

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: vi.fn(),
  },
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

import { toast } from "sonner"
import { useLGPDRequests } from "../useLGPDRequests"

const mockRequests = [
  {
    id: "req-1",
    type: "Acesso aos Dados",
    patient: "João Silva",
    date: "2025-11-15",
    status: "pendente",
    deadline: "2025-11-30",
  },
  {
    id: "req-2",
    type: "Exclusão de Dados",
    patient: "Maria Santos",
    date: "2025-11-14",
    status: "em_analise",
    deadline: "2025-11-29",
  },
]

const mockConsents = [
  {
    id: "cons-1",
    patient: "João Silva",
    type: "Tratamento de Dados",
    granted: true,
    date: "2025-11-01",
    expires: "2026-11-01",
  },
  {
    id: "cons-2",
    patient: "Maria Santos",
    type: "Marketing",
    granted: false,
    date: "2025-11-05",
    expires: "-",
  },
]

function TestConsumer() {
  const { requests, consents, isLoading, createRequest, updateRequestStatus } =
    useLGPDRequests()

  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="requests-count">{requests.length}</div>
      <div data-testid="consents-count">{consents.length}</div>
      <div data-testid="requests">{JSON.stringify(requests)}</div>
      <div data-testid="consents">{JSON.stringify(consents)}</div>
      <button
        data-testid="create-request"
        onClick={() =>
          createRequest({
            type: "Portabilidade",
            patient: "Pedro Costa",
            date: "2025-11-16",
            status: "pendente",
            deadline: "2025-12-01",
          })
        }
      >
        Criar Solicitação
      </button>
      <button
        data-testid="update-status"
        onClick={() =>
          updateRequestStatus({ id: "req-1", status: "concluida" })
        }
      >
        Atualizar Status
      </button>
    </div>
  )
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("useLGPDRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    authState.clinicId = "clinic-1"
    authState.user = { id: "user-1" }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state then fetch requests and consents", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/lgpd/solicitacoes") return Promise.resolve(mockRequests)
      if (url === "/lgpd/consentimentos") return Promise.resolve(mockConsents)
      return Promise.resolve([])
    })

    render(<TestConsumer />, { wrapper: createWrapper() })

    expect(screen.getByTestId("loading").textContent).toBe("loading")

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"))

    expect(screen.getByTestId("requests-count").textContent).toBe("2")
    expect(screen.getByTestId("consents-count").textContent).toBe("2")
    expect(screen.getByTestId("requests").textContent).toContain("req-1")
    expect(screen.getByTestId("consents").textContent).toContain("cons-1")
    expect(mockGet).toHaveBeenCalledWith("/lgpd/solicitacoes")
    expect(mockGet).toHaveBeenCalledWith("/lgpd/consentimentos")
  })

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null

    render(<TestConsumer />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"))

    expect(screen.getByTestId("requests-count").textContent).toBe("0")
    expect(screen.getByTestId("consents-count").textContent).toBe("0")
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should show empty arrays when requests fetch returns empty", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/lgpd/solicitacoes") return Promise.resolve([])
      if (url === "/lgpd/consentimentos") return Promise.resolve(mockConsents)
      return Promise.resolve([])
    })

    render(<TestConsumer />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"))

    expect(screen.getByTestId("requests-count").textContent).toBe("0")
    expect(screen.getByTestId("consents-count").textContent).toBe("2")
  })

  it("should handle fetch errors gracefully", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/lgpd/solicitacoes") return Promise.reject(new Error("Network error"))
      if (url === "/lgpd/consentimentos") return Promise.resolve([])
      return Promise.resolve([])
    })

    render(<TestConsumer />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"))

    // On error, requests should be empty and loading should finish
    expect(screen.getByTestId("requests-count").textContent).toBe("0")
  })

  // ─────────────────────────────────────────────────────────────
  // CRUD - Create request
  // ─────────────────────────────────────────────────────────────

  it("should create a request via mutation", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/lgpd/solicitacoes") return Promise.resolve(mockRequests)
      if (url === "/lgpd/consentimentos") return Promise.resolve(mockConsents)
      return Promise.resolve([])
    })
    mockPost.mockResolvedValueOnce({ id: "req-3", type: "Portabilidade" })

    render(<TestConsumer />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"))

    await act(async () => {
      screen.getByTestId("create-request").click()
    })

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Solicitação criada!"))

    expect(mockPost).toHaveBeenCalledWith(
      "/lgpd/solicitacoes",
      expect.objectContaining({
        type: "Portabilidade",
        patient: "Pedro Costa",
        requested_by: "user-1",
      })
    )
  })

  it("should show toast.error on create request failure", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/lgpd/solicitacoes") return Promise.resolve(mockRequests)
      if (url === "/lgpd/consentimentos") return Promise.resolve(mockConsents)
      return Promise.resolve([])
    })
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    render(<TestConsumer />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"))

    await act(async () => {
      screen.getByTestId("create-request").click()
    })

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Erro ao criar solicitação"))
  })

  // ─────────────────────────────────────────────────────────────
  // CRUD - Update request status
  // ─────────────────────────────────────────────────────────────

  it("should update request status via mutation", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/lgpd/solicitacoes") return Promise.resolve(mockRequests)
      if (url === "/lgpd/consentimentos") return Promise.resolve(mockConsents)
      return Promise.resolve([])
    })
    mockPatch.mockResolvedValueOnce({})

    render(<TestConsumer />, { wrapper: createWrapper() })

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"))

    await act(async () => {
      screen.getByTestId("update-status").click()
    })

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Status atualizado!"))

    expect(mockPatch).toHaveBeenCalledWith("/lgpd/solicitacoes/req-1", { status: "concluida" })
  })
})
