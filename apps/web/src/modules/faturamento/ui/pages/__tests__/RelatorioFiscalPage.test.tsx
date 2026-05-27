import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const mockGet = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1" }),
}))

import RelatorioFiscalPage from "../RelatorioFiscalPage"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const mockRelatorio = {
  notas: [
    {
      id: "n1",
      numero: 123,
      serie: 1,
      chave_acesso: "12345678901234567890123456789012345678901234",
      valor_total: 10000,
      valor_icms: 1200,
      valor_iss: 500,
      status: "AUTORIZADA",
      data_emissao: "2026-05-27",
    },
  ],
  totais: {
    valorTotal: 10000,
    valorIcms: 1200,
    valorIss: 500,
    valorIpi: 0,
    valorPis: 0,
    valorCofins: 0,
    quantidade: 1,
  },
}

describe("RelatorioFiscalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call api with correct endpoint", async () => {
    mockGet.mockResolvedValueOnce(mockRelatorio)

    render(<RelatorioFiscalPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/faturamento/relatorio?")
    }, { timeout: 3000 })
  })

  it("should render relatorio data after loading", async () => {
    mockGet.mockResolvedValueOnce(mockRelatorio)

    render(<RelatorioFiscalPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText("Total em Notas")).toBeTruthy()
    }, { timeout: 3000 })

    expect(screen.queryByText("ICMS")).toBeTruthy()
    expect(screen.queryByText("123")).toBeTruthy()
    expect(screen.queryByText("AUTORIZADA")).toBeTruthy()
  })
})
