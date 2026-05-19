import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TISSBatchList } from "../TISSBatchList"

vi.mock("@/lib/utils/status.utils", () => ({
  getStatusColor: (status: string) => status,
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

describe("TISSBatchList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render list title", () => {
    render(<TISSBatchList />)

    expect(screen.getByText("Lotes TISS")).toBeTruthy()
  })

  it("should render all batch items", () => {
    render(<TISSBatchList />)

    expect(screen.getByText("Lote 202511001")).toBeTruthy()
    expect(screen.getByText("Lote 202511002")).toBeTruthy()
    expect(screen.getByText("Lote 202511003")).toBeTruthy()
  })

  it("should render batch insurance and guide count", () => {
    render(<TISSBatchList />)

    expect(screen.getByText("Unimed • 45 guias")).toBeTruthy()
    expect(screen.getByText("Bradesco Saúde • 32 guias")).toBeTruthy()
    expect(screen.getByText("Amil • 28 guias")).toBeTruthy()
  })

  it("should render batch values", () => {
    render(<TISSBatchList />)

    expect(screen.getByText("R$ 18.750,00")).toBeTruthy()
    expect(screen.getByText("R$ 14.200,00")).toBeTruthy()
    expect(screen.getByText("R$ 12.450,00")).toBeTruthy()
  })

  it("should render status badges", () => {
    render(<TISSBatchList />)

    const badges = screen.getAllByTestId("badge")
    expect(badges).toHaveLength(3)
    expect(badges[0].textContent).toBe("enviado")
    expect(badges[1].textContent).toBe("processando")
    expect(badges[2].textContent).toBe("pendente")
  })

  it("should render details buttons", () => {
    render(<TISSBatchList />)

    const buttons = screen.getAllByText("Detalhes")
    expect(buttons).toHaveLength(3)
  })
})
