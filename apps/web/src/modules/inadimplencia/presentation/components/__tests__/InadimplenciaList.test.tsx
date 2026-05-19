import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { InadimplenciaList } from "../InadimplenciaList"

vi.mock("@/lib/utils/status.utils", () => ({
  getStatusColor: () => "default",
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock("lucide-react", () => ({
  AlertCircle: () => <svg data-testid="icon-alert" />,
  MessageSquare: () => <svg data-testid="icon-message" />,
  Phone: () => <svg data-testid="icon-phone" />,
}))

describe("InadimplenciaList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render list title", () => {
    render(<InadimplenciaList />)
    expect(screen.getByText("Lista de Inadimplentes")).toBeTruthy()
  })

  it("should render all debtors with correct names", () => {
    render(<InadimplenciaList />)

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Maria Santos")).toBeTruthy()
    expect(screen.getByText("Pedro Costa")).toBeTruthy()
  })

  it("should render all debtor values", () => {
    render(<InadimplenciaList />)

    expect(screen.getByText("R$ 1.850,00")).toBeTruthy()
    expect(screen.getByText("R$ 3.200,00")).toBeTruthy()
    expect(screen.getByText("R$ 950,00")).toBeTruthy()
  })

  it("should render days overdue for each debtor", () => {
    render(<InadimplenciaList />)

    expect(screen.getByText("15 dias de atraso")).toBeTruthy()
    expect(screen.getByText("45 dias de atraso")).toBeTruthy()
    expect(screen.getByText("8 dias de atraso")).toBeTruthy()
  })

  it("should render status badges for each debtor", () => {
    render(<InadimplenciaList />)

    expect(screen.getByText("em_negociacao")).toBeTruthy()
    expect(screen.getByText("critico")).toBeTruthy()
    expect(screen.getByText("novo")).toBeTruthy()
  })

  it("should render action buttons for each debtor", () => {
    render(<InadimplenciaList />)

    const messageIcons = screen.getAllByTestId("icon-message")
    const phoneIcons = screen.getAllByTestId("icon-phone")

    expect(messageIcons).toHaveLength(3)
    expect(phoneIcons).toHaveLength(3)
  })

  it("should render alert icon for each debtor", () => {
    render(<InadimplenciaList />)

    const alertIcons = screen.getAllByTestId("icon-alert")
    expect(alertIcons).toHaveLength(3)
  })
})
