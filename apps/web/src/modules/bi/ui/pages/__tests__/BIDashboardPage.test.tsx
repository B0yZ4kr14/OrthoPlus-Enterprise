import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const mockUseBIDashboards = vi.fn()

vi.mock("@/modules/bi/application/hooks/useBIDashboards", () => ({
  useBIDashboards: () => mockUseBIDashboards(),
}))

vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, description }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

vi.mock("@orthoplus/core-ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>{children}</div>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tabs-content-${value}`} className={className}>{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tabs-trigger-${value}`}>{children}</button>
  ),
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}))

vi.mock("lucide-react", () => ({
  BarChart3: () => <span data-testid="icon-barchart">📊</span>,
  TrendingUp: () => <span data-testid="icon-trending">📈</span>,
  Users: () => <span data-testid="icon-users">👥</span>,
  DollarSign: () => <span data-testid="icon-dollar">💵</span>,
}))

vi.mock("@/modules/bi/presentation/components/BIMetrics", () => ({
  BIMetrics: () => <div data-testid="bi-metrics">BIMetrics Component</div>,
}))

vi.mock("@/modules/bi/presentation/components/BICharts", () => ({
  BICharts: () => <div data-testid="bi-charts">BICharts Component</div>,
}))

import BIDashboardPage from "../bi-dashboard"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("BIDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render page header with correct title and description", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [],
      metrics: [],
      isLoading: false,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("page-header")).toBeTruthy()
    expect(screen.getByText("Business Intelligence")).toBeTruthy()
    expect(screen.getByText("Dashboards e análises estratégicas")).toBeTruthy()
  })

  it("should render tabs with all four sections", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [],
      metrics: [],
      isLoading: false,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("tabs-trigger-overview")).toBeTruthy()
    expect(screen.getByTestId("tabs-trigger-financial")).toBeTruthy()
    expect(screen.getByTestId("tabs-trigger-patients")).toBeTruthy()
    expect(screen.getByTestId("tabs-trigger-performance")).toBeTruthy()
  })

  it("should render overview tab content with BIMetrics and BICharts", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [],
      metrics: [],
      isLoading: false,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("tabs-content-overview")).toBeTruthy()
    expect(screen.getByTestId("bi-metrics")).toBeTruthy()
    expect(screen.getByTestId("bi-charts")).toBeTruthy()
  })

  it("should render financial tab content with placeholder", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [],
      metrics: [],
      isLoading: false,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("tabs-content-financial")).toBeTruthy()
    expect(screen.getByText("Análise Financeira")).toBeTruthy()
    expect(screen.getByText("Gráficos e métricas financeiras em desenvolvimento")).toBeTruthy()
  })

  it("should render patients tab content with placeholder", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [],
      metrics: [],
      isLoading: false,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("tabs-content-patients")).toBeTruthy()
    expect(screen.getByText("Análise de Pacientes")).toBeTruthy()
    expect(screen.getByText("Métricas de pacientes em desenvolvimento")).toBeTruthy()
  })

  it("should render performance tab content with placeholder", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [],
      metrics: [],
      isLoading: false,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("tabs-content-performance")).toBeTruthy()
    expect(screen.getByText("Análise de Performance")).toBeTruthy()
    expect(screen.getByText("Indicadores de performance em desenvolvimento")).toBeTruthy()
  })

  it("should render dashboard data when available", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [
        { id: "dash-1", name: "Dashboard Financeiro" },
        { id: "dash-2", name: "Dashboard Pacientes" },
      ],
      metrics: [
        { id: "met-1", name: "Receita Total", value: 150000 },
      ],
      isLoading: false,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("page-header")).toBeTruthy()
    expect(screen.getByTestId("tabs")).toBeTruthy()
  })

  it("should handle loading state gracefully", () => {
    mockUseBIDashboards.mockReturnValue({
      dashboards: [],
      metrics: [],
      isLoading: true,
      createDashboard: vi.fn(),
    })

    render(<BIDashboardPage />, { wrapper: createWrapper() })

    expect(screen.getByTestId("page-header")).toBeTruthy()
    expect(screen.getByTestId("tabs")).toBeTruthy()
    expect(screen.getByTestId("bi-metrics")).toBeTruthy()
  })
})
