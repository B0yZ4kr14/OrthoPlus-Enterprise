import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import Landpage from "../Landpage"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useReducedMotion: () => false,
}))

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 {...props}>{children}</h3>
  ),
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
}))

vi.mock("lucide-react", () => ({
  Users: () => <svg data-testid="icon-users" />,
  Calendar: () => <svg data-testid="icon-calendar" />,
  DollarSign: () => <svg data-testid="icon-dollar" />,
  FileText: () => <svg data-testid="icon-filetext" />,
  Receipt: () => <svg data-testid="icon-receipt" />,
  Megaphone: () => <svg data-testid="icon-megaphone" />,
  Check: () => <svg data-testid="icon-check" />,
  ArrowRight: () => <svg data-testid="icon-arrow" />,
  Mail: () => <svg data-testid="icon-mail" />,
}))

describe("Landpage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────────────────────

  it("should render the page without crashing", () => {
    render(<Landpage />)
    expect(screen.getAllByText("OrthoPlus Enterprise").length).toBeGreaterThanOrEqual(2)
  })

  it("should render hero section with main title", () => {
    render(<Landpage />)
    expect(
      screen.getByText("Gestão Premium para Clínicas Odontológicas"),
    ).toBeTruthy()
    expect(
      screen.getByText(
        /Sistema completo de gestão clínica, financeira e comercial/i,
      ),
    ).toBeTruthy()
  })

  it("should render version badge", () => {
    render(<Landpage />)
    expect(
      screen.getByText("Versão 5.6 — Multi-clínica & Multi-tenant"),
    ).toBeTruthy()
  })

  it("should render theme toggle button", () => {
    render(<Landpage />)
    expect(screen.getByTestId("theme-toggle")).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────
  // Features Section
  // ─────────────────────────────────────────────────────────────

  it("should render all 6 features", () => {
    render(<Landpage />)

    const featureTitles = [
      "Gestão de Pacientes",
      "Agenda Inteligente",
      "Financeiro Completo",
      "Prontuário Eletrônico",
      "Faturamento TISS",
      "Marketing Automático",
    ]

    featureTitles.forEach((title) => {
      const matches = screen.getAllByText(title)
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })

  it("should render features section heading", () => {
    render(<Landpage />)
    expect(screen.getByText("Tudo que sua clínica precisa")).toBeTruthy()
    expect(
      screen.getByText(
        /Módulos integrados que conversam entre si, eliminando retrabalho/i,
      ),
    ).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────
  // Pricing Section
  // ─────────────────────────────────────────────────────────────

  it("should render all 3 pricing plans", () => {
    render(<Landpage />)

    expect(screen.getByText("Starter")).toBeTruthy()
    expect(screen.getByText("Professional")).toBeTruthy()
    expect(screen.getAllByText("Enterprise").length).toBeGreaterThanOrEqual(1)
  })

  it("should render pricing section heading", () => {
    render(<Landpage />)
    expect(screen.getByText("Planos e Preços")).toBeTruthy()
    expect(
      screen.getByText(
        /Escolha o plano ideal para o tamanho da sua operação/i,
      ),
    ).toBeTruthy()
  })

  it("should render recommended badge on Professional plan", () => {
    render(<Landpage />)
    expect(screen.getByText("Recomendado")).toBeTruthy()
  })

  it("should render pricing values", () => {
    render(<Landpage />)
    expect(screen.getByText("R$ 197")).toBeTruthy()
    expect(screen.getByText("R$ 497")).toBeTruthy()
    expect(screen.getByText("Sob consulta")).toBeTruthy()
  })

  it("should render pricing CTA buttons", () => {
    render(<Landpage />)
    expect(screen.getByText("Começar Agora")).toBeTruthy()
    expect(screen.getByText("Escolher Professional")).toBeTruthy()
    expect(screen.getByText("Falar com Consultor")).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────
  // Footer
  // ─────────────────────────────────────────────────────────────

  it("should render footer with contact email", () => {
    render(<Landpage />)
    expect(screen.getByText("contato@tsiapp.io")).toBeTruthy()
    expect(
      screen.getByText(/OrthoPlus Enterprise © 2026/),
    ).toBeTruthy()
  })

  it("should render footer navigation links", () => {
    render(<Landpage />)
    expect(screen.getAllByText("Entrar no Sistema").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Termos de Uso")).toBeTruthy()
    expect(screen.getByText("Privacidade")).toBeTruthy()
  })

  // ─────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────

  it("should navigate to /auth when clicking navbar CTA button", () => {
    render(<Landpage />)

    const ctaButtons = screen.getAllByText("Entrar no Sistema")
    act(() => {
      ctaButtons[0].click()
    })

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/auth")
  })

  it("should navigate to /auth when clicking hero CTA button", () => {
    render(<Landpage />)

    const ctaButtons = screen.getAllByText("Entrar no Sistema")
    act(() => {
      ctaButtons[1].click()
    })

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/auth")
  })

  it("should navigate to /auth when clicking pricing card CTA", () => {
    render(<Landpage />)

    const ctaButton = screen.getByText("Começar Agora")
    act(() => {
      ctaButton.click()
    })

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/auth")
  })

  it("should navigate to /auth when clicking footer link", () => {
    render(<Landpage />)

    const footerLinks = screen.getAllByText("Entrar no Sistema")
    // The footer link is typically the last one
    const footerLink = footerLinks[footerLinks.length - 1]
    act(() => {
      footerLink.click()
    })

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/auth")
  })

  it("should have 'Ver Planos' button that scrolls to pricing", () => {
    render(<Landpage />)
    const verPlanosButton = screen.getByText("Ver Planos")
    expect(verPlanosButton).toBeTruthy()
  })
})
