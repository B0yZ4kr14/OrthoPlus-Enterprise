import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { CobrancaAutomation } from "../CobrancaAutomation"

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}))

vi.mock("@orthoplus/core-ui/label", () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>{children}</label>
  ),
}))

vi.mock("@orthoplus/core-ui/input", () => ({
  Input: ({ id, type, placeholder, defaultValue, ...props }: any) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...props}
    />
  ),
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock("@orthoplus/core-ui/switch", () => ({
  Switch: ({ id, defaultChecked, ...props }: any) => (
    <input
      id={id}
      type="checkbox"
      defaultChecked={defaultChecked}
      data-testid={`switch-${id}`}
      {...props}
    />
  ),
}))

vi.mock("@orthoplus/core-ui/textarea", () => ({
  Textarea: ({ id, placeholder, defaultValue, rows, ...props }: any) => (
    <textarea
      id={id}
      placeholder={placeholder}
      defaultValue={defaultValue}
      rows={rows}
      {...props}
    />
  ),
}))

describe("CobrancaAutomation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render automation card title and description", () => {
    render(<CobrancaAutomation />)

    expect(screen.getByText("Automação de Cobrança")).toBeTruthy()
    expect(screen.getByText("Configure mensagens automáticas")).toBeTruthy()
  })

  it("should render all switch toggles", () => {
    render(<CobrancaAutomation />)

    expect(screen.getByText("SMS Automático")).toBeTruthy()
    expect(screen.getByText("WhatsApp Automático")).toBeTruthy()
    expect(screen.getByText("E-mail Automático")).toBeTruthy()
  })

  it("should render days input with default value", () => {
    render(<CobrancaAutomation />)

    const daysInput = screen.getByDisplayValue("3")
    expect(daysInput).toBeTruthy()
    expect(daysInput.getAttribute("type")).toBe("number")
  })

  it("should render template card title and description", () => {
    render(<CobrancaAutomation />)

    expect(screen.getByText("Template de Mensagem")).toBeTruthy()
    expect(screen.getByText("Personalize a mensagem de cobrança")).toBeTruthy()
  })

  it("should render textarea with default template message", () => {
    render(<CobrancaAutomation />)

    const textarea = screen.getByDisplayValue(
      "Olá {NOME}, identificamos um débito de {VALOR} com vencimento em {DATA}. Por favor, regularize sua situação.",
    )
    expect(textarea).toBeTruthy()
  })

  it("should render save template button", () => {
    render(<CobrancaAutomation />)

    expect(screen.getByText("Salvar Template")).toBeTruthy()
  })

  it("should render switches with correct default checked states", () => {
    render(<CobrancaAutomation />)

    const smsSwitch = screen.getByTestId("switch-auto-sms")
    const whatsappSwitch = screen.getByTestId("switch-auto-whatsapp")
    const emailSwitch = screen.getByTestId("switch-auto-email")

    expect(smsSwitch).toBeTruthy()
    expect(whatsappSwitch).toBeTruthy()
    expect(emailSwitch).toBeTruthy()
  })
})
