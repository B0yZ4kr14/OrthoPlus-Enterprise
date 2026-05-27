import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import type { ReactNode } from "react"
import { Lead } from "@/modules/crm/domain/entities/Lead"
import { LeadCard } from "../LeadCard"

const mockOnEdit = vi.fn()
const mockOnDelete = vi.fn()
const mockOnStatusChange = vi.fn()

vi.mock("@/lib/utils/status.utils", () => ({
  getStatusColor: (status: string) => {
    const map: Record<string, string> = {
      NOVO: "default",
      CONTATO_INICIAL: "secondary",
      QUALIFICADO: "outline",
      PROPOSTA: "default",
      NEGOCIACAO: "secondary",
      GANHO: "default",
      PERDIDO: "destructive",
    }
    return map[status] || "default"
  },
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant, className }: { children?: ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: {
    children?: ReactNode
    onClick?: () => void
    variant?: string
    size?: string
    className?: string
  } & Record<string, unknown>) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}))

const mockLead = {
  id: "lead-1",
  nome: "João Silva",
  email: "joao@example.com",
  telefone: "(11) 98765-4321",
  origem: "SITE",
  status: "NOVO",
  interesseDescricao: "Aparelho ortodôntico",
  valorEstimado: 5000,
  createdAt: new Date("2024-01-15T10:00:00"),
  updatedAt: new Date("2024-01-15T10:00:00"),
}

const mockLeadGanho = {
  ...mockLead,
  id: "lead-2",
  status: "GANHO",
  valorEstimado: 8000,
}

const mockLeadPerdido = {
  ...mockLead,
  id: "lead-3",
  status: "PERDIDO",
}

const mockLeadSemContato = {
  ...mockLead,
  id: "lead-4",
  email: undefined,
  telefone: undefined,
  interesseDescricao: undefined,
  valorEstimado: undefined,
}

describe("LeadCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Render lead data
  // ─────────────────────────────────────────────────────────────

  it("should render lead name and status", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Novo")).toBeTruthy()
  })

  it("should render contact info", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText("joao@example.com")).toBeTruthy()
    expect(screen.getByText("(11) 98765-4321")).toBeTruthy()
  })

  it("should render interest and estimated value", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText("Interesse:")).toBeTruthy()
    expect(screen.getByText("Aparelho ortodôntico")).toBeTruthy()
    expect(screen.getByText(/R\$/)).toBeTruthy()
    expect(screen.getByText(/5\.000,00/)).toBeTruthy()
  })

  it("should render origin badge", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText("SITE")).toBeTruthy()
  })

  it("should render creation date", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText(/Criado:/)).toBeTruthy()
    expect(screen.getByText(/15 de janeiro de 2024/)).toBeTruthy()
  })

  it("should not render contact section when email and telefone are absent", () => {
    render(
      <LeadCard
        lead={mockLeadSemContato as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.queryByText("joao@example.com")).toBeNull()
    expect(screen.queryByText("(11) 98765-4321")).toBeNull()
  })

  it("should not render interest section when no interest or value", () => {
    render(
      <LeadCard
        lead={mockLeadSemContato as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.queryByText("Interesse:")).toBeNull()
    expect(screen.queryByText(/R\$/)).toBeNull()
  })

  it("should render correct status labels for different statuses", () => {
    const { rerender } = render(
      <LeadCard
        lead={{ ...mockLead, status: "CONTATO_INICIAL" } as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText("Contato Inicial")).toBeTruthy()

    rerender(
      <LeadCard
        lead={{ ...mockLead, status: "PROPOSTA" } as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText("Proposta Enviada")).toBeTruthy()

    rerender(
      <LeadCard
        lead={{ ...mockLead, status: "NEGOCIACAO" } as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    expect(screen.getByText("Em Negociação")).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────
  // Click handlers
  // ─────────────────────────────────────────────────────────────

  it("should call onEdit when clicking edit button", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    const buttons = screen.getAllByRole("button")
    act(() => {
      buttons[0].click()
    })

    expect(mockOnEdit).toHaveBeenCalledTimes(1)
    expect(mockOnEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: "lead-1", nome: "João Silva" }),
    )
  })

  it("should call onDelete when clicking delete button", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    const buttons = screen.getAllByRole("button")
    act(() => {
      buttons[1].click()
    })

    expect(mockOnDelete).toHaveBeenCalledTimes(1)
    expect(mockOnDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "lead-1" }),
    )
  })

  it("should call onStatusChange when clicking status update button", () => {
    render(
      <LeadCard
        lead={mockLead as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    const buttons = screen.getAllByRole("button")
    // Status update button is the last one
    act(() => {
      buttons[buttons.length - 1].click()
    })

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1)
    expect(mockOnStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "lead-1" }),
    )
  })

  it("should not render status update button for GANHO leads", () => {
    render(
      <LeadCard
        lead={mockLeadGanho as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    const buttons = screen.getAllByRole("button")
    // Only edit and delete buttons
    expect(buttons).toHaveLength(2)
    expect(mockOnStatusChange).not.toHaveBeenCalled()
  })

  it("should not render status update button for PERDIDO leads", () => {
    render(
      <LeadCard
        lead={mockLeadPerdido as unknown as Lead}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />,
    )

    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(2)
  })

  it("should not render action buttons when handlers are not provided", () => {
    render(<LeadCard lead={mockLead as unknown as Lead} />)

    const buttons = screen.queryAllByRole("button")
    expect(buttons).toHaveLength(0)
  })

  it("should render only edit button when only onEdit is provided", () => {
    render(<LeadCard lead={mockLead as unknown as Lead} onEdit={mockOnEdit} />)

    const buttons = screen.getAllByRole("button")
    // Edit + status update (since onStatusChange is not provided, only edit)
    expect(buttons).toHaveLength(1)

    act(() => {
      buttons[0].click()
    })

    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })
})
