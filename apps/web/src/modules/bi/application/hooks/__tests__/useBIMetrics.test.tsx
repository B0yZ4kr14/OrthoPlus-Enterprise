import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
}

const mockGet = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

import { useBIMetrics, BIMetric, BIWidget } from "../useBIMetrics"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockMetrics: BIMetric[] = [
  {
    id: "met-1",
    clinic_id: "clinic-1",
    metric_key: "total_revenue",
    name: "Receita Total",
    value: 150000,
    trend: 12.5,
    calculation_type: "sum",
    aggregation_period: "monthly",
    last_calculated_at: "2024-01-01T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "met-2",
    clinic_id: "clinic-1",
    metric_key: "new_patients",
    name: "Novos Pacientes",
    value: 45,
    calculation_type: "count",
    aggregation_period: "monthly",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "met-3",
    clinic_id: "clinic-1",
    metric_key: "occupancy_rate",
    name: "Taxa de Ocupação",
    value: 87,
    calculation_type: "percentage",
    aggregation_period: "daily",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "met-4",
    clinic_id: "clinic-1",
    metric_key: "avg_ticket",
    name: "Ticket Médio",
    value: 1485,
    calculation_type: "average",
    aggregation_period: "monthly",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

const mockDashboards = [
  { id: "dash-1", name: "Dashboard Financeiro", clinic_id: "clinic-1" },
]

const mockWidgets: BIWidget[] = [
  {
    id: "wid-1",
    dashboard_id: "dash-1",
    clinic_id: "clinic-1",
    name: "Widget Receita",
    widget_type: "chart",
    chart_type: "bar",
    data_source: "financial",
    query_config: {},
    created_at: "2024-01-01T00:00:00Z",
  },
]

describe("useBIMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    authState.clinicId = "clinic-1"
    authState.user = { id: "user-1" }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch metrics on mount", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/metricas") return Promise.resolve(mockMetrics)
      if (url === "/bi/dashboards") return Promise.resolve(mockDashboards)
      if (url === "/bi/widgets") return Promise.resolve(mockWidgets)
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useBIMetrics(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.metrics).toHaveLength(4)
    expect(result.current.metrics[0].metric_key).toBe("total_revenue")
    expect(mockGet).toHaveBeenCalledWith("/bi/metricas")
    expect(mockGet).toHaveBeenCalledWith("/bi/dashboards")
    expect(mockGet).toHaveBeenCalledWith("/bi/widgets")
  })

  it("should return empty arrays when clinicId is null", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => useBIMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.metrics).toHaveLength(0)
    expect(result.current.dashboards).toHaveLength(0)
    expect(result.current.widgets).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should not fetch widgets when dashboards is empty", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/metricas") return Promise.resolve(mockMetrics)
      if (url === "/bi/dashboards") return Promise.resolve([])
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useBIMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.dashboards).toHaveLength(0)
    expect(result.current.widgets).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalledWith("/bi/widgets")
  })

  // ─────────────────────────────────────────────────────────────
  // Calculated metrics
  // ─────────────────────────────────────────────────────────────

  it("should calculate metrics correctly from fetched data", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/metricas") return Promise.resolve(mockMetrics)
      if (url === "/bi/dashboards") return Promise.resolve(mockDashboards)
      if (url === "/bi/widgets") return Promise.resolve(mockWidgets)
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useBIMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.calculatedMetrics.totalRevenue).toBe(150000)
    expect(result.current.calculatedMetrics.newPatients).toBe(45)
    expect(result.current.calculatedMetrics.occupancyRate).toBe(87)
    expect(result.current.calculatedMetrics.avgTicket).toBe(1485)
  })

  it("should return 0 for calculated metrics when metric_key is not found", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/metricas") return Promise.resolve([])
      if (url === "/bi/dashboards") return Promise.resolve(mockDashboards)
      if (url === "/bi/widgets") return Promise.resolve(mockWidgets)
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useBIMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.calculatedMetrics.totalRevenue).toBe(0)
    expect(result.current.calculatedMetrics.newPatients).toBe(0)
    expect(result.current.calculatedMetrics.occupancyRate).toBe(0)
    expect(result.current.calculatedMetrics.avgTicket).toBe(0)
  })

  it("should handle partial metrics data", async () => {
    const partialMetrics = [mockMetrics[0], mockMetrics[2]]
    mockGet.mockImplementation((url: string) => {
      if (url === "/bi/metricas") return Promise.resolve(partialMetrics)
      if (url === "/bi/dashboards") return Promise.resolve(mockDashboards)
      if (url === "/bi/widgets") return Promise.resolve(mockWidgets)
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useBIMetrics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.calculatedMetrics.totalRevenue).toBe(150000)
    expect(result.current.calculatedMetrics.newPatients).toBe(0)
    expect(result.current.calculatedMetrics.occupancyRate).toBe(87)
    expect(result.current.calculatedMetrics.avgTicket).toBe(0)
  })
})
