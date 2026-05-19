import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { LGPDAuditTrail } from "../LGPDAuditTrail"

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

describe("LGPDAuditTrail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render card title", () => {
    render(<LGPDAuditTrail />)
    expect(screen.getByTestId("card-title").textContent).toBe("Trilha de Auditoria")
  })

  it("should render all audit log items", () => {
    render(<LGPDAuditTrail />)

    expect(screen.getByText("Acesso ao Prontuário")).toBeTruthy()
    expect(screen.getByText("Exportação de Dados")).toBeTruthy()
    expect(screen.getByText("Consentimento Atualizado")).toBeTruthy()
  })

  it("should render action badges", () => {
    render(<LGPDAuditTrail />)

    const badges = screen.getAllByTestId("badge")
    expect(badges.length).toBe(3)
    expect(badges[0].textContent).toBe("Acesso ao Prontuário")
    expect(badges[1].textContent).toBe("Exportação de Dados")
    expect(badges[2].textContent).toBe("Consentimento Atualizado")
  })

  it("should render timestamps", () => {
    render(<LGPDAuditTrail />)

    expect(screen.getByText("2025-11-15 14:30")).toBeTruthy()
    expect(screen.getByText("2025-11-15 13:15")).toBeTruthy()
    expect(screen.getByText("2025-11-15 12:00")).toBeTruthy()
  })

  it("should render details descriptions", () => {
    render(<LGPDAuditTrail />)

    expect(screen.getByText("Visualizou prontuário do paciente #12345")).toBeTruthy()
    expect(screen.getByText("Exportou dados do paciente #67890")).toBeTruthy()
    expect(screen.getByText("Paciente atualizou consentimento de marketing")).toBeTruthy()
  })

  it("should render user names", () => {
    render(<LGPDAuditTrail />)

    expect(screen.getByText(/Por: Dr. João Silva/)).toBeTruthy()
    expect(screen.getByText(/Por: Admin/)).toBeTruthy()
    expect(screen.getByText(/Por: Sistema/)).toBeTruthy()
  })
})
