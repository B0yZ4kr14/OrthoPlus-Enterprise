import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import MetasGamificacao from "../MetasGamificacao"

const mockGet = vi.fn()
const mockToast = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    clinicId: "clinic-1",
  }),
}))

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, description }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, className, depth, ...props }: any) => (
    <div className={className} data-depth={depth} {...props}>{children}</div>
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}))

vi.mock("@orthoplus/core-ui/progress", () => ({
  Progress: ({ value }: any) => <progress value={value} max={100} data-testid="progress" />,
}))

describe("MetasGamificacao", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockToast.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const mockMetas = [
    {
      id: "meta-1",
      periodo_inicio: "2024-01-01",
      periodo_fim: "2024-01-31",
      meta_valor: "10000.00",
      status: "ATINGIDA",
      percentual_atingido: "100.00",
      quantidade_atingida: 50,
      meta_quantidade: 50,
      valor_atingido: "10000.00",
      premiacao: { nome: "Bônus Jan", descricao: "Bônus de janeiro" },
      premiacao_paga: true,
    },
    {
      id: "meta-2",
      periodo_inicio: "2024-02-01",
      periodo_fim: "2024-02-29",
      meta_valor: "12000.00",
      status: "NAO_ATINGIDA",
      percentual_atingido: "75.00",
      quantidade_atingida: 30,
      meta_quantidade: 40,
      valor_atingido: "9000.00",
      premiacao: null,
      premiacao_paga: false,
    },
  ]

  const mockRanking = [
    {
      id: "rank-1",
      vendedor_id: "user-1",
      badge: "OURO",
      posicao: 1,
      vendedor: { full_name: "João Silva" },
      pontos: 1500,
      total_vendas: "25000.00",
      quantidade_vendas: 100,
      ticket_medio: "250.00",
    },
    {
      id: "rank-2",
      vendedor_id: "v2",
      badge: "PRATA",
      posicao: 2,
      vendedor: { full_name: "Maria Souza" },
      pontos: 1200,
      total_vendas: "20000.00",
      quantidade_vendas: 80,
      ticket_medio: "250.00",
    },
  ]

  const mockApiResponse = {
    metas: mockMetas,
    ranking: mockRanking,
  }

  it("should render loading state initially", () => {
    mockGet.mockImplementation(() => new Promise(() => {}))

    render(<MetasGamificacao />)

    expect(screen.getByText("Carregando...")).toBeTruthy()
  })

  it("should render page title after loading", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("Metas e Gamificação")).toBeTruthy()
    expect(screen.getByText("Acompanhe suas metas, conquistas e posição no ranking")).toBeTruthy()
  })

  it("should render metas section with data", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("Minhas Metas")).toBeTruthy()
    expect(screen.getByText("ATINGIDA")).toBeTruthy()
    expect(screen.getByText("NAO ATINGIDA")).toBeTruthy()
  })

  it("should render progress bars for metas", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    const progressBars = screen.getAllByTestId("progress")
    expect(progressBars.length).toBeGreaterThanOrEqual(1)
  })

  it("should render premiacao info when available", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("Bônus Jan")).toBeTruthy()
    expect(screen.getByText("Bônus de janeiro")).toBeTruthy()
    expect(screen.getByText("Pago")).toBeTruthy()
  })

  it("should render empty state when no metas", async () => {
    mockGet.mockResolvedValueOnce({
      metas: [],
      ranking: mockRanking,
    })

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("Nenhuma meta cadastrada")).toBeTruthy()
  })

  it("should render ranking section with data", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("Ranking de Vendedores")).toBeTruthy()
    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Maria Souza")).toBeTruthy()
  })

  it("should render ranking period buttons", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("Dia")).toBeTruthy()
    expect(screen.getByText("Semana")).toBeTruthy()
    expect(screen.getByText("Mês")).toBeTruthy()
  })

  it("should change period when clicking ranking buttons", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)
    mockGet.mockResolvedValueOnce({
      metas: mockMetas,
      ranking: mockRanking,
    })

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    const diaButton = screen.getByText("Dia")
    act(() => {
      diaButton.click()
    })

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2))
  })

  it("should render empty ranking state", async () => {
    mockGet.mockResolvedValueOnce({
      metas: mockMetas,
      ranking: [],
    })

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("Nenhum dado de ranking disponível")).toBeTruthy()
  })

  it("should call API with correct params", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(mockGet).toHaveBeenCalled())

    expect(mockGet).toHaveBeenCalledWith("/pdv/metas-gamificacao", {
      params: expect.objectContaining({
        clinicId: "clinic-1",
        userId: "user-1",
        periodoRanking: "MES",
        dataReferencia: expect.any(String),
      }),
    })
  })

  it("should show toast error on API failure", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(mockToast).toHaveBeenCalledWith({
      title: "Erro",
      description: "Não foi possível carregar os dados de metas e ranking",
      variant: "destructive",
    })
  })

  it("should highlight current user in ranking", async () => {
    mockGet.mockResolvedValueOnce(mockApiResponse)

    render(<MetasGamificacao />)

    await waitFor(() => expect(screen.queryByText("Carregando...")).toBeNull())

    expect(screen.getByText("#1")).toBeTruthy()
    expect(screen.getByText("#2")).toBeTruthy()
  })
})
