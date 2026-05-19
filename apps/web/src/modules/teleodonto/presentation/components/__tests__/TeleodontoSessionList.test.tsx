import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TeleodontoSessionList } from "../TeleodontoSessionList"

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant} data-testid="badge">
      {children}
    </span>
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

describe("TeleodontoSessionList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render the session list title", () => {
    render(<TeleodontoSessionList />)
    expect(screen.getByText("Sessões Recentes")).toBeTruthy()
  })

  it("should render all sessions with patient names", () => {
    render(<TeleodontoSessionList />)

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Maria Santos")).toBeTruthy()
    expect(screen.getByText("Pedro Costa")).toBeTruthy()
  })

  it("should render session dates and times", () => {
    render(<TeleodontoSessionList />)

    // Date 2025-11-15 appears 3 times (once per session)
    expect(screen.getAllByText("2025-11-15")).toHaveLength(3)
    expect(screen.getByText("14:00")).toBeTruthy()
    expect(screen.getByText("15:00")).toBeTruthy()
    expect(screen.getByText("16:00")).toBeTruthy()
  })

  it("should render status badges with correct variants", () => {
    render(<TeleodontoSessionList />)

    const badges = screen.getAllByTestId("badge")
    expect(badges).toHaveLength(3)

    // concluida -> default
    expect(badges[0].getAttribute("data-variant")).toBe("default")
    expect(badges[0].textContent).toBe("concluida")

    // agendada -> secondary
    expect(badges[1].getAttribute("data-variant")).toBe("secondary")
    expect(badges[1].textContent).toBe("agendada")

    // em_andamento -> destructive
    expect(badges[2].getAttribute("data-variant")).toBe("destructive")
    expect(badges[2].textContent).toBe("em_andamento")
  })

  it("should render Detalhes buttons for each session", () => {
    render(<TeleodontoSessionList />)

    const buttons = screen.getAllByText("Detalhes")
    expect(buttons).toHaveLength(3)
  })

  it("should render session cards", () => {
    render(<TeleodontoSessionList />)

    const cards = screen.getAllByTestId("card")
    expect(cards.length).toBeGreaterThanOrEqual(1)
  })
})
