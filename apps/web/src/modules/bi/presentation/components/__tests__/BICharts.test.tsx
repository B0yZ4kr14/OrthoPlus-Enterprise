import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { BICharts } from "../BICharts"

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}))

describe("BICharts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render all four chart cards", () => {
    render(<BICharts />)

    const cards = screen.getAllByTestId("card")
    expect(cards).toHaveLength(4)
  })

  it("should render chart titles", () => {
    render(<BICharts />)

    expect(screen.getByText("Receita por Período")).toBeTruthy()
    expect(screen.getByText("Procedimentos Mais Realizados")).toBeTruthy()
    expect(screen.getByText("Taxa de Conversão")).toBeTruthy()
    expect(screen.getByText("Satisfação dos Pacientes")).toBeTruthy()
  })

  it("should render placeholder text for charts in development", () => {
    render(<BICharts />)

    const placeholders = screen.getAllByText("Gráfico em desenvolvimento")
    expect(placeholders).toHaveLength(4)
  })
})
