import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { TISSGuideForm } from "../TISSGuideForm"

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
}))

vi.mock("@orthoplus/core-ui/label", () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}))

vi.mock("@orthoplus/core-ui/input", () => ({
  Input: ({ id, placeholder, ...props }: any) => (
    <input id={id} placeholder={placeholder} {...props} />
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, variant, ...props }: any) => (
    <button data-variant={variant} {...props}>{children}</button>
  ),
}))

vi.mock("@orthoplus/core-ui/select", () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children, id }: any) => <div data-testid="select-trigger" id={id}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}))

describe("TISSGuideForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render form title and description", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Nova Guia TISS")).toBeTruthy()
    expect(screen.getByText("Preencha os dados da guia de atendimento")).toBeTruthy()
  })

  it("should render patient select", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Paciente")).toBeTruthy()
    const selectValues = screen.getAllByTestId("select-value")
    expect(selectValues.length).toBeGreaterThanOrEqual(1)
    expect(selectValues[0].textContent).toBe("Selecione o paciente")
  })

  it("should render insurance select", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Convênio")).toBeTruthy()
    expect(screen.getAllByTestId("select-value").length).toBeGreaterThanOrEqual(2)
  })

  it("should render guide number input", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Número da Guia")).toBeTruthy()
    expect(screen.getByPlaceholderText("2025110001")).toBeTruthy()
  })

  it("should render procedure select", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Procedimento")).toBeTruthy()
    expect(screen.getAllByTestId("select-value").length).toBeGreaterThanOrEqual(3)
  })

  it("should render cancel and save buttons", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Cancelar")).toBeTruthy()
    expect(screen.getByText("Salvar Guia")).toBeTruthy()
  })

  it("should render all select options for patients", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Maria Santos")).toBeTruthy()
    expect(screen.getByText("Pedro Costa")).toBeTruthy()
  })

  it("should render all select options for insurance", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Unimed")).toBeTruthy()
    expect(screen.getByText("Bradesco Saúde")).toBeTruthy()
    expect(screen.getByText("Amil")).toBeTruthy()
  })

  it("should render all select options for procedures", () => {
    render(<TISSGuideForm />)

    expect(screen.getByText("Consulta")).toBeTruthy()
    expect(screen.getByText("Limpeza")).toBeTruthy()
    expect(screen.getByText("Restauração")).toBeTruthy()
  })
})
