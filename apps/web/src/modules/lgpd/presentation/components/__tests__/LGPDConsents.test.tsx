import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { LGPDConsents } from "../LGPDConsents"

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}))

vi.mock("lucide-react", () => ({
  CheckCircle: ({ className }: any) => <span data-testid="check-circle" className={className}>check</span>,
  XCircle: ({ className }: any) => <span data-testid="x-circle" className={className}>x</span>,
}))

describe("LGPDConsents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render card title", () => {
    render(<LGPDConsents />)
    expect(screen.getByTestId("card-title").textContent).toBe("Consentimentos Ativos")
  })

  it("should render all consent items", () => {
    render(<LGPDConsents />)

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Maria Santos")).toBeTruthy()
    expect(screen.getByText("Pedro Costa")).toBeTruthy()
  })

  it("should render consent types", () => {
    render(<LGPDConsents />)

    expect(screen.getByText("Tratamento de Dados")).toBeTruthy()
    expect(screen.getByText("Marketing")).toBeTruthy()
    expect(screen.getByText("Compartilhamento")).toBeTruthy()
  })

  it("should render granted and denied badges", () => {
    render(<LGPDConsents />)

    const badges = screen.getAllByTestId("badge")
    expect(badges.length).toBe(3)
    expect(badges[0].textContent).toBe("Concedido")
    expect(badges[0].getAttribute("data-variant")).toBe("default")
    expect(badges[1].textContent).toBe("Negado")
    expect(badges[1].getAttribute("data-variant")).toBe("secondary")
    expect(badges[2].textContent).toBe("Concedido")
  })

  it("should render check icons for granted consents", () => {
    render(<LGPDConsents />)

    const checkIcons = screen.getAllByTestId("check-circle")
    expect(checkIcons.length).toBe(2)
  })

  it("should render x icon for denied consent", () => {
    render(<LGPDConsents />)

    const xIcons = screen.getAllByTestId("x-circle")
    expect(xIcons.length).toBe(1)
  })

  it("should render expiration dates", () => {
    render(<LGPDConsents />)

    expect(screen.getByText(/Expira: 2026-11-01/)).toBeTruthy()
    expect(screen.getByText(/Expira: -/)).toBeTruthy()
    expect(screen.getByText(/Expira: 2026-11-10/)).toBeTruthy()
  })
})
