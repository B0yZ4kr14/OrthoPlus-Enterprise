import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import SplitPagamentoPage from "./split-pagamento"

let mockClinicId: string | null = "clinic-1"

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    clinicId: mockClinicId,
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("SplitPagamentoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClinicId = "clinic-1"
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("should render page header with title and description", () => {
    render(<SplitPagamentoPage />, { wrapper: createWrapper() })

    expect(screen.getByText("Split de Pagamento")).toBeTruthy()
    expect(screen.getByText("Divisão automática de receitas e otimização tributária")).toBeTruthy()
  })

  it("should render all three tabs", () => {
    render(<SplitPagamentoPage />, { wrapper: createWrapper() })

    expect(screen.getByRole("tab", { name: /Dashboard/i })).toBeTruthy()
    expect(screen.getByRole("tab", { name: /Configurações/i })).toBeTruthy()
    expect(screen.getByRole("tab", { name: /Histórico/i })).toBeTruthy()
  })

  it("should render Nova Regra button", () => {
    render(<SplitPagamentoPage />, { wrapper: createWrapper() })

    expect(screen.getByRole("button", { name: /Nova Regra/i })).toBeTruthy()
  })

  it("should display Dashboard content by default", () => {
    render(<SplitPagamentoPage />, { wrapper: createWrapper() })

    expect(screen.getByText("SplitDashboard Component")).toBeTruthy()
  })

  it("should render tab panels for config and history", () => {
    render(<SplitPagamentoPage />, { wrapper: createWrapper() })

    expect(screen.getAllByRole("tabpanel").length).toBeGreaterThanOrEqual(1)
  })
})
