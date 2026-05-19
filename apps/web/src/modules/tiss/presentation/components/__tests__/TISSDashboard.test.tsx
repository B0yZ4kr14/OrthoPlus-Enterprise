import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TISSDashboard } from "../TISSDashboard"

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

vi.mock("lucide-react", () => ({
  FileText: () => <span data-testid="icon-filetext" />,
  Send: () => <span data-testid="icon-send" />,
  CheckCircle: () => <span data-testid="icon-checkcircle" />,
  XCircle: () => <span data-testid="icon-xcircle" />,
}))

describe("TISSDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render all stat cards", () => {
    render(<TISSDashboard />)

    expect(screen.getByText("Guias Pendentes")).toBeTruthy()
    expect(screen.getByText("Enviadas este Mês")).toBeTruthy()
    expect(screen.getByText("Taxa de Aprovação")).toBeTruthy()
    expect(screen.getByText("Glosas")).toBeTruthy()
  })

  it("should render correct stat values", () => {
    render(<TISSDashboard />)

    expect(screen.getByText("23")).toBeTruthy()
    expect(screen.getByText("142")).toBeTruthy()
    expect(screen.getByText("94%")).toBeTruthy()
    expect(screen.getByText("8")).toBeTruthy()
  })

  it("should render trend descriptions", () => {
    render(<TISSDashboard />)

    expect(screen.getByText("aguardando envio")).toBeTruthy()
    expect(screen.getByText("vs. mês anterior")).toBeTruthy()
    expect(screen.getByText("excelente")).toBeTruthy()
    expect(screen.getByText("redução")).toBeTruthy()
  })

  it("should render trend indicators", () => {
    render(<TISSDashboard />)

    expect(screen.getByText("+5")).toBeTruthy()
    expect(screen.getByText("+12%")).toBeTruthy()
    expect(screen.getByText("+2%")).toBeTruthy()
    expect(screen.getByText("-3")).toBeTruthy()
  })

  it("should render 4 card components", () => {
    render(<TISSDashboard />)

    const cards = screen.getAllByTestId("card")
    expect(cards).toHaveLength(4)
  })
})
