import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { CryptoPaymentHistory } from "../CryptoPaymentHistory"

const mockGet = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
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

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button data-variant={variant} data-size={size} onClick={onClick}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, className }: any) => (
    <td className={className}>{children}</td>
  ),
  TableHead: ({ children, className }: any) => (
    <th className={className}>{children}</th>
  ),
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}))

const mockPayments = [
  {
    id: "pay-1",
    invoice_id: "inv-001",
    amount_brl: 1500.5,
    crypto_amount: 0.0043,
    crypto_currency: "BTC",
    status: "CONFIRMED",
    created_at: "2024-06-15T10:30:00.000Z",
    confirmed_at: "2024-06-15T10:35:00.000Z",
    transaction_id: "tx-hash-1",
  },
  {
    id: "pay-2",
    invoice_id: "inv-002",
    amount_brl: 2500,
    crypto_amount: 0.0071,
    crypto_currency: "BTC",
    status: "PENDING",
    created_at: "2024-06-16T14:00:00.000Z",
    transaction_id: undefined,
  },
  {
    id: "pay-3",
    invoice_id: "inv-003",
    amount_brl: 800,
    crypto_amount: undefined,
    crypto_currency: undefined,
    status: "FAILED",
    created_at: "2024-06-17T09:15:00.000Z",
    transaction_id: undefined,
  },
]

describe("CryptoPaymentHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
  })

  it("should show loading state initially", () => {
    mockGet.mockImplementation(() => new Promise(() => {}))

    render(<CryptoPaymentHistory />)

    expect(screen.getByTestId("card-content")).toBeTruthy()
    expect(screen.getByTestId("card-content").className).toContain("flex")
  })

  it("should show empty state when no payments", async () => {
    mockGet.mockResolvedValueOnce([])

    render(<CryptoPaymentHistory />)

    await waitFor(() => {
      expect(screen.getByText("Nenhum pagamento encontrado")).toBeTruthy()
    })

    expect(
      screen.getByText("Os pagamentos em criptomoeda aparecerão aqui"),
    ).toBeTruthy()
  })

  it("should render payment list with correct data", async () => {
    mockGet.mockResolvedValueOnce(mockPayments)

    render(<CryptoPaymentHistory />)

    await waitFor(() => {
      expect(screen.getByText("Histórico de Pagamentos")).toBeTruthy()
    })

    // Invoice IDs
    expect(screen.getByText("inv-001")).toBeTruthy()
    expect(screen.getByText("inv-002")).toBeTruthy()
    expect(screen.getByText("inv-003")).toBeTruthy()

    // BRL values formatted
    expect(screen.getByText("R$ 1500.50")).toBeTruthy()
    expect(screen.getByText("R$ 2500.00")).toBeTruthy()
    expect(screen.getByText("R$ 800.00")).toBeTruthy()

    // Crypto amounts
    expect(screen.getByText(/0.00430000/)).toBeTruthy()
    expect(screen.getByText(/0.00710000/)).toBeTruthy()

    // Missing crypto shows dash
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1)

    // Status badges
    const badges = screen.getAllByTestId("badge")
    expect(badges.length).toBe(3)
    expect(badges[0].textContent).toBe("Confirmado")
    expect(badges[1].textContent).toBe("Pendente")
    expect(badges[2].textContent).toBe("Falhou")
  })

  it("should call apiClient with correct endpoint", async () => {
    mockGet.mockResolvedValueOnce([])

    render(<CryptoPaymentHistory />)

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/crypto/payments?limit=20")
    })
  })

  it("should open blockchain explorer when clicking external link button", async () => {
    mockGet.mockResolvedValueOnce(mockPayments)

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    render(<CryptoPaymentHistory />)

    await waitFor(() => {
      expect(screen.getByText("inv-001")).toBeTruthy()
    })

    const buttons = screen.getAllByRole("button")
    // Only the first payment has a transaction_id, so there should be 1 button
    expect(buttons.length).toBe(1)

    buttons[0].click()

    expect(openSpy).toHaveBeenCalledWith(
      "https://blockchair.com/search?q=tx-hash-1",
      "_blank",
    )

    openSpy.mockRestore()
  })
})
