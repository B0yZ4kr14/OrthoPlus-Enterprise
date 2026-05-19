import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import PortalPacientePage from "../PortalPaciente"

// Mock PageHeader
vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, description }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

// Mock UI components from @orthoplus/core-ui
vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  UserCircle: () => <svg data-testid="user-circle-icon" />,
  Calendar: () => <svg data-testid="calendar-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  CreditCard: () => <svg data-testid="credit-card-icon" />,
  Bell: () => <svg data-testid="bell-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
}))

describe("PortalPacientePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render page header with title and description", () => {
    render(<PortalPacientePage />)

    expect(screen.getByText("Portal do Paciente")).toBeTruthy()
    expect(
      screen.getByText("Área de autoatendimento e gestão de informações pessoais"),
    ).toBeTruthy()
  })

  it("should render summary cards with zero counts", () => {
    render(<PortalPacientePage />)

    expect(screen.getByText("Pacientes Cadastrados")).toBeTruthy()
    expect(screen.getByText("Agendamentos Online")).toBeTruthy()
    expect(screen.getByText("Documentos Enviados")).toBeTruthy()

    // All counts are "0"
    const zeroCounts = screen.getAllByText("0")
    expect(zeroCounts.length).toBeGreaterThanOrEqual(3)
  })

  it("should render funcionality list", () => {
    render(<PortalPacientePage />)

    expect(screen.getByText("Funcionalidades do Portal")).toBeTruthy()
    expect(screen.getByText("O que os pacientes podem fazer")).toBeTruthy()

    expect(screen.getByText("Agendamento Online")).toBeTruthy()
    expect(screen.getByText("Marcar consultas 24/7")).toBeTruthy()

    expect(screen.getByText("Acesso ao Prontuário")).toBeTruthy()
    expect(screen.getByText("Visualizar histórico médico")).toBeTruthy()

    expect(screen.getByText("Pagamentos Online")).toBeTruthy()
    expect(screen.getByText("Consultar e pagar débitos")).toBeTruthy()

    expect(screen.getByText("Notificações")).toBeTruthy()
    expect(screen.getByText("Lembretes de consultas")).toBeTruthy()
  })

  it("should render settings section with action buttons", () => {
    render(<PortalPacientePage />)

    expect(screen.getByText("Configurações do Portal")).toBeTruthy()
    expect(
      screen.getByText("Personalize a experiência dos pacientes"),
    ).toBeTruthy()

    expect(screen.getByText("Personalizar Branding")).toBeTruthy()
    expect(screen.getByText("Configurar Notificações")).toBeTruthy()
    expect(screen.getByText("Regras de Agendamento")).toBeTruthy()
    expect(screen.getByText("Métodos de Pagamento")).toBeTruthy()
  })

  it("should render card descriptions", () => {
    render(<PortalPacientePage />)

    expect(screen.getByText("Com acesso ao portal")).toBeTruthy()
    expect(screen.getByText("Este mês")).toBeTruthy()
    expect(screen.getByText("Documentos digitais")).toBeTruthy()
  })
})
