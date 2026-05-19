import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/lib/utils/formatting.utils", () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
}))

// Mock UI components
vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}))

vi.mock("@orthoplus/core-ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-variant={variant} className={className}>
      {children}
    </span>
  ),
}))

vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, description, actions }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      {actions && <div>{actions}</div>}
    </div>
  ),
}))

// Mock the presentation hook
const mockUseOrcamentos = vi.fn()

vi.mock("../../../presentation/hooks/useOrcamentos", () => ({
  useOrcamentos: () => mockUseOrcamentos(),
}))

import OrcamentosPage from "../OrcamentosPage"

function createMockOrcamento(overrides: any = {}) {
  return {
    id: "orc-1",
    numeroOrcamento: "ORC-001",
    clinicId: "clinic-1",
    patientId: "patient-1",
    createdBy: "user-1",
    titulo: "Tratamento Ortodôntico",
    descricao: "Descrição",
    tipoPlano: "PREMIUM",
    validadeDias: 30,
    dataExpiracao: new Date("2027-06-18"),
    status: "RASCUNHO",
    valorSubtotal: 5000,
    descontoPercentual: 10,
    descontoValor: 500,
    valorTotal: 4500,
    observacoes: "",
    aprovadoPor: undefined,
    aprovadoEm: undefined,
    rejeitadoPor: undefined,
    rejeitadoEm: undefined,
    motivoRejeicao: undefined,
    convertidoContrato: false,
    contratoId: undefined,
    createdAt: new Date("2025-05-19"),
    updatedAt: new Date("2025-05-19"),
    isDraft: () => overrides.status === "RASCUNHO" || !overrides.status,
    isPending: () => overrides.status === "PENDENTE",
    isApproved: () => overrides.status === "APROVADO",
    ...overrides,
  }
}

describe("OrcamentosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
    mockUseOrcamentos.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render loading state", () => {
    mockUseOrcamentos.mockReturnValue({
      orcamentos: [],
      loading: true,
      enviarOrcamento: vi.fn(),
      aprovarOrcamento: vi.fn(),
      orcamentosRascunho: [],
      orcamentosPendentes: [],
      orcamentosAprovados: [],
      totalOrcamentos: 0,
      totalValor: 0,
    })

    render(<OrcamentosPage />)

    expect(screen.getByText("Carregando...")).toBeTruthy()
  })

  it("should render page with orcamentos", () => {
    mockUseOrcamentos.mockReturnValue({
      orcamentos: [
        createMockOrcamento({ id: "orc-1", titulo: "Tratamento 1", status: "RASCUNHO" }),
        createMockOrcamento({ id: "orc-2", titulo: "Tratamento 2", status: "PENDENTE" }),
      ],
      loading: false,
      enviarOrcamento: vi.fn(),
      aprovarOrcamento: vi.fn(),
      orcamentosRascunho: [
        createMockOrcamento({ id: "orc-1", titulo: "Tratamento 1", status: "RASCUNHO" }),
      ],
      orcamentosPendentes: [
        createMockOrcamento({ id: "orc-2", titulo: "Tratamento 2", status: "PENDENTE" }),
      ],
      orcamentosAprovados: [],
      totalOrcamentos: 2,
      totalValor: 9000,
    })

    render(<OrcamentosPage />)

    expect(screen.getByText("Orçamentos")).toBeTruthy()
    expect(screen.getByText("Gerencie propostas e aprovações de tratamentos")).toBeTruthy()

    // Both orcamentos appear in the "all" tab
    const allTab = screen.getByTestId("tab-content-all")
    expect(allTab.textContent).toContain("Tratamento 1")
    expect(allTab.textContent).toContain("Tratamento 2")
    // Total value appears in the metrics cards (outside tabs)
    expect(screen.getByText("R$ 9000.00")).toBeTruthy()
  })

  it("should render tabs for filtering by status", () => {
    mockUseOrcamentos.mockReturnValue({
      orcamentos: [
        createMockOrcamento({ id: "orc-1", titulo: "Rascunho 1", status: "RASCUNHO" }),
        createMockOrcamento({ id: "orc-2", titulo: "Pendente 1", status: "PENDENTE" }),
        createMockOrcamento({ id: "orc-3", titulo: "Aprovado 1", status: "APROVADO" }),
      ],
      loading: false,
      enviarOrcamento: vi.fn(),
      aprovarOrcamento: vi.fn(),
      orcamentosRascunho: [
        createMockOrcamento({ id: "orc-1", titulo: "Rascunho 1", status: "RASCUNHO" }),
      ],
      orcamentosPendentes: [
        createMockOrcamento({ id: "orc-2", titulo: "Pendente 1", status: "PENDENTE" }),
      ],
      orcamentosAprovados: [
        createMockOrcamento({ id: "orc-3", titulo: "Aprovado 1", status: "APROVADO" }),
      ],
      totalOrcamentos: 3,
      totalValor: 13500,
    })

    render(<OrcamentosPage />)

    expect(screen.getByTestId("tab-all")).toBeTruthy()
    expect(screen.getByTestId("tab-rascunho")).toBeTruthy()
    expect(screen.getByTestId("tab-pendente")).toBeTruthy()
    expect(screen.getByTestId("tab-aprovado")).toBeTruthy()

    // Check tab content contains the right items
    expect(screen.getByTestId("tab-content-rascunho").textContent).toContain("Rascunho 1")
    expect(screen.getByTestId("tab-content-pendente").textContent).toContain("Pendente 1")
    expect(screen.getByTestId("tab-content-aprovado").textContent).toContain("Aprovado 1")
  })

  it("should call enviarOrcamento when clicking Enviar on a draft", async () => {
    const mockEnviar = vi.fn().mockResolvedValue(undefined)

    mockUseOrcamentos.mockReturnValue({
      orcamentos: [
        createMockOrcamento({ id: "orc-1", titulo: "Rascunho 1", status: "RASCUNHO" }),
      ],
      loading: false,
      enviarOrcamento: mockEnviar,
      aprovarOrcamento: vi.fn(),
      orcamentosRascunho: [
        createMockOrcamento({ id: "orc-1", titulo: "Rascunho 1", status: "RASCUNHO" }),
      ],
      orcamentosPendentes: [],
      orcamentosAprovados: [],
      totalOrcamentos: 1,
      totalValor: 4500,
    })

    render(<OrcamentosPage />)

    // Click the first "Enviar" button (in the "all" tab)
    const enviarButtons = screen.getAllByText("Enviar")
    await act(async () => {
      enviarButtons[0].click()
    })

    expect(mockEnviar).toHaveBeenCalledTimes(1)
    expect(mockEnviar).toHaveBeenCalledWith("orc-1")
  })

  it("should call aprovarOrcamento when clicking Aprovar on a pending orcamento", async () => {
    const mockAprovar = vi.fn().mockResolvedValue(undefined)

    mockUseOrcamentos.mockReturnValue({
      orcamentos: [
        createMockOrcamento({ id: "orc-1", titulo: "Pendente 1", status: "PENDENTE" }),
      ],
      loading: false,
      enviarOrcamento: vi.fn(),
      aprovarOrcamento: mockAprovar,
      orcamentosRascunho: [],
      orcamentosPendentes: [
        createMockOrcamento({ id: "orc-1", titulo: "Pendente 1", status: "PENDENTE" }),
      ],
      orcamentosAprovados: [],
      totalOrcamentos: 1,
      totalValor: 4500,
    })

    render(<OrcamentosPage />)

    // Click the first "Aprovar" button (in the "all" tab)
    const aprovarButtons = screen.getAllByText("Aprovar")
    await act(async () => {
      aprovarButtons[0].click()
    })

    expect(mockAprovar).toHaveBeenCalledTimes(1)
    expect(mockAprovar).toHaveBeenCalledWith("orc-1")
  })

  it("should render empty state when no orcamentos", () => {
    mockUseOrcamentos.mockReturnValue({
      orcamentos: [],
      loading: false,
      enviarOrcamento: vi.fn(),
      aprovarOrcamento: vi.fn(),
      orcamentosRascunho: [],
      orcamentosPendentes: [],
      orcamentosAprovados: [],
      totalOrcamentos: 0,
      totalValor: 0,
    })

    render(<OrcamentosPage />)

    expect(screen.getByText("Orçamentos")).toBeTruthy()
    // The total value should show R$ 0.00
    expect(screen.getByText("R$ 0.00")).toBeTruthy()
    // Empty tabs should not contain orcamento cards
    expect(screen.getByTestId("tab-content-all").children.length).toBe(0)
  })

  it("should show error toast when enviar fails", async () => {
    const mockEnviar = vi.fn().mockRejectedValue(new Error("Erro"))

    mockUseOrcamentos.mockReturnValue({
      orcamentos: [
        createMockOrcamento({ id: "orc-1", titulo: "Rascunho 1", status: "RASCUNHO" }),
      ],
      loading: false,
      enviarOrcamento: mockEnviar,
      aprovarOrcamento: vi.fn(),
      orcamentosRascunho: [
        createMockOrcamento({ id: "orc-1", titulo: "Rascunho 1", status: "RASCUNHO" }),
      ],
      orcamentosPendentes: [],
      orcamentosAprovados: [],
      totalOrcamentos: 1,
      totalValor: 4500,
    })

    const { toast } = await import("sonner")
    render(<OrcamentosPage />)

    const enviarButtons = screen.getAllByText("Enviar")
    await act(async () => {
      enviarButtons[0].click()
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao enviar orçamento")
    })
  })
})
