import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { TISSDashboard } from "../TISSDashboard"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1", user: { id: "user-1" } }),
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
}))

vi.mock("@orthoplus/core-ui/skeleton", () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />,
}))

vi.mock("lucide-react", () => ({
  FileText: () => <span data-testid="icon-filetext" />,
  Send: () => <span data-testid="icon-send" />,
  CheckCircle: () => <span data-testid="icon-checkcircle" />,
  XCircle: () => <span data-testid="icon-xcircle" />,
  AlertTriangle: () => <span data-testid="icon-alerttriangle" />,
}))

const mockGet = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const defaultStats = {
  guides: {
    total: 173,
    total_amount: 2500000,
    total_glosa: 45000,
    by_status: [
      { status: "pendente", _count: { id: 23 }, _sum: { amount: 345000 } },
      { status: "enviada", _count: { id: 142 }, _sum: { amount: 2130000 } },
      { status: "aprovada", _count: { id: 163 }, _sum: { amount: 2455000 } },
      { status: "glosada", _count: { id: 8 }, _sum: { amount: 45000 } },
    ],
  },
  batches: {
    by_status: [],
  },
}

describe("TISSDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockGet.mockImplementation((url: string) => {
      if (url === "/tiss/statistics") return Promise.resolve(defaultStats)
      return Promise.resolve([])
    })
  })

  it("should render all stat cards", async () => {
    render(<TISSDashboard />, { wrapper: createWrapper() })

    expect(await screen.findByText("Guias Pendentes")).toBeTruthy()
    expect(screen.getByText("Enviadas")).toBeTruthy()
    expect(screen.getByText("Taxa de Aprovação")).toBeTruthy()
    expect(screen.getByText("Glosas")).toBeTruthy()
    expect(screen.getByText("Valor Glosado")).toBeTruthy()
  })

  it("should render correct stat values", async () => {
    render(<TISSDashboard />, { wrapper: createWrapper() })

    expect(await screen.findByText("23")).toBeTruthy()
    expect(screen.getByText("142")).toBeTruthy()
    expect(screen.getByText("94%")).toBeTruthy()
    expect(screen.getByText("8")).toBeTruthy()
    expect(screen.getByText(/R\$/)).toBeTruthy()
  })

  it("should render descriptions", async () => {
    render(<TISSDashboard />, { wrapper: createWrapper() })

    expect(await screen.findByText("aguardando envio")).toBeTruthy()
    expect(screen.getByText("em processamento")).toBeTruthy()
    expect(screen.getByText("guias aprovadas")).toBeTruthy()
    expect(screen.getByText("guias glosadas")).toBeTruthy()
    expect(screen.getByText("total em glosas")).toBeTruthy()
  })

  it("should render 5 card components", async () => {
    render(<TISSDashboard />, { wrapper: createWrapper() })

    const cards = await screen.findAllByTestId("card")
    expect(cards).toHaveLength(5)
  })

  it("should render loading skeletons when isLoading", () => {
    mockGet.mockImplementation(() => new Promise(() => {}))
    render(<TISSDashboard />, { wrapper: createWrapper() })

    const skeletons = screen.getAllByTestId("skeleton")
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
