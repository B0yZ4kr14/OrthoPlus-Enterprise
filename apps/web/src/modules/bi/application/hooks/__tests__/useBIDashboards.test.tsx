import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
}

const mockGet = vi.fn()
const mockPost = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
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
import { useBIDashboards } from "../useBIDashboards"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockDashboards = [
  { id: "dash-1", name: "Dashboard Financeiro", clinic_id: "clinic-1" },
  { id: "dash-2", name: "Dashboard Pacientes", clinic_id: "clinic-1" },
]

const mockMetrics = [
  { id: "met-1", metric_key: "total_revenue", name: "Receita Total", value: 150000 },
  { id: "met-2", metric_key: "new_patients", name: "Novos Pacientes", value: 45 },
]

describe("useBIDashboards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    authState.clinicId = "clinic-1"
    authState.user = { id: "user-1" }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch dashboards on mount", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/dashboards") return Promise.resolve(mockDashboards)
      if (url === "/bi/metricas") return Promise.resolve(mockMetrics)
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useBIDashboards(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.dashboards).toHaveLength(2)
    expect(result.current.dashboards[0].name).toBe("Dashboard Financeiro")
    expect(result.current.metrics).toHaveLength(2)
    expect(result.current.metrics[0].metric_key).toBe("total_revenue")
    expect(mockGet).toHaveBeenCalledWith("/bi/dashboards")
    expect(mockGet).toHaveBeenCalledWith("/bi/metricas")
  })

  it("should return empty arrays when clinicId is null", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => useBIDashboards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.dashboards).toHaveLength(0)
    expect(result.current.metrics).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should handle fetch error gracefully", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useBIDashboards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.dashboards).toHaveLength(0)
  })

  // ─────────────────────────────────────────────────────────────
  // createDashboard (CRUD)
  // ─────────────────────────────────────────────────────────────

  it("should create a dashboard and invalidate queries", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/dashboards") return Promise.resolve(mockDashboards)
      if (url === "/bi/metricas") return Promise.resolve(mockMetrics)
      return Promise.resolve([])
    })
    mockPost.mockResolvedValueOnce({ id: "dash-3", name: "Novo Dashboard" })

    const { result } = renderHook(() => useBIDashboards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createDashboard({ name: "Novo Dashboard" })
    })

    expect(mockPost).toHaveBeenCalledWith("/bi/dashboards", {
      name: "Novo Dashboard",
      created_by: "user-1",
    })
    expect(toast.success).toHaveBeenCalledWith("Dashboard criado!")
  })

  it("should show toast.error when createDashboard fails", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/dashboards") return Promise.resolve(mockDashboards)
      if (url === "/bi/metricas") return Promise.resolve(mockMetrics)
      return Promise.resolve([])
    })
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useBIDashboards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createDashboard({ name: "Falha" })
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar dashboard")
  })
})
