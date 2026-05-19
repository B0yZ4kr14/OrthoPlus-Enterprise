import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import PDVPage from "../PDVPage"

const mockUsePDV = vi.fn()

vi.mock("@/hooks/usePDV", () => ({
  usePDV: (...args: unknown[]) => mockUsePDV(...args),
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1" }),
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
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, disabled, title, className, variant, size, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} title={title} className={className} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))

vi.mock("@orthoplus/core-ui/input", () => ({
  Input: ({ value, onChange, placeholder, id, type, step, min, max, disabled, ...props }: any) => (
    <input
      id={id}
      type={type || "text"}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      disabled={disabled}
      {...props}
    />
  ),
}))

vi.mock("@orthoplus/core-ui/label", () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}))

vi.mock("@orthoplus/core-ui/separator", () => ({
  Separator: () => <hr />,
}))

vi.mock("@/components/shared/EmptyState", () => ({
  EmptyState: ({ message }: any) => <div>{message}</div>,
}))

vi.mock("@/components/shared/CardTopBorder", () => ({
  CardTopBorder: () => null,
}))

vi.mock("@/components/pdv/AberturaCaixaDialog", () => ({
  AberturaCaixaDialog: ({ open, onOpenChange }: any) =>
    open ? (
      <div data-testid="abertura-dialog">
        <button onClick={() => onOpenChange(false)}>Fechar Dialog</button>
      </div>
    ) : null,
}))

vi.mock("@/components/pdv/FechamentoCaixaDialog", () => ({
  FechamentoCaixaDialog: ({ open, onOpenChange }: any) =>
    open ? (
      <div data-testid="fechamento-dialog">
        <button onClick={() => onOpenChange(false)}>Fechar Dialog</button>
      </div>
    ) : null,
}))

describe("PDVPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePDV.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const defaultUsePDVReturn = {
    caixaAberto: null,
    vendas: [],
    loading: false,
    abrirCaixa: vi.fn(),
    fecharCaixa: vi.fn(),
    criarVenda: vi.fn(),
    cancelarVenda: vi.fn(),
    reload: vi.fn(),
  }

  it("should render loading state", () => {
    mockUsePDV.mockReturnValue({ ...defaultUsePDVReturn, loading: true })

    render(<PDVPage />)

    expect(screen.getByText("Carregando...")).toBeTruthy()
    expect(screen.getByText("Ponto de Venda (PDV)")).toBeTruthy()
  })

  it("should render caixa fechado state", () => {
    mockUsePDV.mockReturnValue(defaultUsePDVReturn)

    render(<PDVPage />)

    expect(screen.getByText("Caixa Fechado")).toBeTruthy()
    expect(screen.getByText("Abra o caixa para iniciar as vendas.")).toBeTruthy()
    expect(screen.getByText("Abrir Caixa")).toBeTruthy()
  })

  it("should open abertura dialog when clicking Abrir Caixa", () => {
    mockUsePDV.mockReturnValue(defaultUsePDVReturn)

    render(<PDVPage />)

    const abrirButton = screen.getByText("Abrir Caixa")
    act(() => {
      abrirButton.click()
    })

    expect(screen.getByTestId("abertura-dialog")).toBeTruthy()
  })

  it("should render caixa aberto state with valor inicial", () => {
    mockUsePDV.mockReturnValue({
      ...defaultUsePDVReturn,
      caixaAberto: {
        id: "caixa-1",
        valor_inicial: 500,
        created_at: "2024-01-15T08:00:00Z",
      },
    })

    render(<PDVPage />)

    expect(screen.getByText("Caixa Aberto")).toBeTruthy()
    // The valor_inicial is formatted as R$ 500,00
    const valores = screen.getAllByText(/R\$/)
    expect(valores.length).toBeGreaterThanOrEqual(1)
  })

  it("should render fechar caixa button when caixa is open", () => {
    mockUsePDV.mockReturnValue({
      ...defaultUsePDVReturn,
      caixaAberto: {
        id: "caixa-1",
        valor_inicial: 500,
        created_at: "2024-01-15T08:00:00Z",
      },
    })

    render(<PDVPage />)

    expect(screen.getByText("Fechar Caixa")).toBeTruthy()
  })

  it("should open fechamento dialog when clicking Fechar Caixa", () => {
    mockUsePDV.mockReturnValue({
      ...defaultUsePDVReturn,
      caixaAberto: {
        id: "caixa-1",
        valor_inicial: 500,
        created_at: "2024-01-15T08:00:00Z",
      },
    })

    render(<PDVPage />)

    const fecharButton = screen.getByText("Fechar Caixa")
    act(() => {
      fecharButton.click()
    })

    expect(screen.getByTestId("fechamento-dialog")).toBeTruthy()
  })

  it("should render adicionar item form", () => {
    mockUsePDV.mockReturnValue({
      ...defaultUsePDVReturn,
      caixaAberto: {
        id: "caixa-1",
        valor_inicial: 500,
        created_at: "2024-01-15T08:00:00Z",
      },
    })

    render(<PDVPage />)

    expect(screen.getByText("Adicionar Item")).toBeTruthy()
    expect(screen.getByLabelText("Descrição")).toBeTruthy()
    expect(screen.getByLabelText("Valor")).toBeTruthy()
    expect(screen.getByLabelText("Qtd")).toBeTruthy()
  })

  it("should disable inputs when caixa is closed", () => {
    mockUsePDV.mockReturnValue(defaultUsePDVReturn)

    render(<PDVPage />)

    const descInput = screen.getByLabelText("Descrição") as HTMLInputElement
    expect(descInput.disabled).toBe(true)
  })

  it("should render formas de pagamento buttons", () => {
    mockUsePDV.mockReturnValue({
      ...defaultUsePDVReturn,
      caixaAberto: {
        id: "caixa-1",
        valor_inicial: 500,
        created_at: "2024-01-15T08:00:00Z",
      },
    })

    render(<PDVPage />)

    expect(screen.getByText("Dinheiro")).toBeTruthy()
    expect(screen.getByText("Cartão Crédito")).toBeTruthy()
    expect(screen.getByText("Cartão Débito")).toBeTruthy()
    expect(screen.getByText("PIX")).toBeTruthy()
    expect(screen.getByText("Transferência")).toBeTruthy()
    expect(screen.getByText("Criptomoeda")).toBeTruthy()
  })

  it("should render pagamento section", () => {
    mockUsePDV.mockReturnValue({
      ...defaultUsePDVReturn,
      caixaAberto: {
        id: "caixa-1",
        valor_inicial: 500,
        created_at: "2024-01-15T08:00:00Z",
      },
    })

    render(<PDVPage />)

    expect(screen.getByText("Pagamento")).toBeTruthy()
    expect(screen.getByText("Finalizar Venda")).toBeTruthy()
  })

  it("should disable finalizar venda when no items", () => {
    mockUsePDV.mockReturnValue({
      ...defaultUsePDVReturn,
      caixaAberto: {
        id: "caixa-1",
        valor_inicial: 500,
        created_at: "2024-01-15T08:00:00Z",
      },
    })

    render(<PDVPage />)

    const finalizarButton = screen.getByText("Finalizar Venda") as HTMLButtonElement
    expect(finalizarButton.disabled).toBe(true)
  })
})
