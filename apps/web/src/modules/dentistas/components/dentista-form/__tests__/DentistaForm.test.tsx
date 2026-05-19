import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { DentistaForm } from "../DentistaForm"
import type { Dentista } from "../../../types/dentista.types"

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()
const mockHandleFormSubmit = vi.fn((data: Dentista) => {
  mockOnSubmit(data)
})
const mockSetAvatarUrl = vi.fn()
const mockSetSelectedDias = vi.fn()
const mockSetSelectedEspecialidades = vi.fn()
const mockSetValue = vi.fn()
const mockRegister = vi.fn(() => ({}))
const mockWatch = vi.fn(() => "")

const mockUseDentistaForm = vi.fn(() => ({
  avatarUrl: null,
  setAvatarUrl: mockSetAvatarUrl,
  register: mockRegister,
  handleSubmit: (fn: any) => (e?: any) => {
    e?.preventDefault?.()
    return fn({
      nome: "Teste",
      cro: "CRO-TESTE",
      cpf: "123.456.789-00",
      email: "teste@teste.com",
      especialidades: ["Clínico Geral"],
      status: "Ativo",
    } as Dentista)
  },
  errors: {},
  setValue: mockSetValue,
  watch: mockWatch,
  selectedDias: [],
  setSelectedDias: mockSetSelectedDias,
  selectedEspecialidades: [],
  setSelectedEspecialidades: mockSetSelectedEspecialidades,
  handleFormSubmit: mockHandleFormSubmit,
}))

vi.mock("@/modules/dentistas/components/dentista-form/useDentistaForm", () => ({
  useDentistaForm: (...args: any[]) => mockUseDentistaForm(...args),
}))

vi.mock("@orthoplus/core-ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}))

vi.mock("@/modules/dentistas/components/dentista-form/DadosPessoaisTab", () => ({
  DadosPessoaisTab: () => <div data-testid="tab-pessoais">Dados Pessoais Tab</div>,
}))

vi.mock("@/modules/dentistas/components/dentista-form/DadosProfissionaisTab", () => ({
  DadosProfissionaisTab: () => (
    <div data-testid="tab-profissionais">Dados Profissionais Tab</div>
  ),
}))

vi.mock("@/modules/dentistas/components/dentista-form/ConfiguracoesTab", () => ({
  ConfiguracoesTab: () => <div data-testid="tab-configuracoes">Configuracoes Tab</div>,
}))

describe("DentistaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render create mode when no dentista is provided", () => {
    render(<DentistaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByText("Novo Dentista")).toBeTruthy()
    expect(screen.getByText("Cadastrar")).toBeTruthy()
    expect(screen.getByText("Cancelar")).toBeTruthy()
  })

  it("should render edit mode when dentista is provided", () => {
    const dentista = {
      id: "1",
      nome: "Dr. Carlos Silva",
      cro: "CRO-SP 12345",
      cpf: "123.456.789-00",
      email: "carlos@clinica.com",
      especialidades: ["Ortodontia"],
      status: "Ativo",
    } as Dentista

    render(<DentistaForm dentista={dentista} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByText("Editar Dentista")).toBeTruthy()
    expect(screen.getByText("Atualizar")).toBeTruthy()
  })

  it("should render all tabs", () => {
    render(<DentistaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByTestId("tabs")).toBeTruthy()
    expect(screen.getByTestId("tab-trigger-pessoais")).toBeTruthy()
    expect(screen.getByTestId("tab-trigger-profissionais")).toBeTruthy()
    expect(screen.getByTestId("tab-trigger-configuracoes")).toBeTruthy()
    expect(screen.getByText("Dados Pessoais")).toBeTruthy()
    expect(screen.getByText("Profissional")).toBeTruthy()
    expect(screen.getByText("Configurações")).toBeTruthy()
  })

  it("should render tab content components", () => {
    render(<DentistaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByText("Dados Pessoais Tab")).toBeTruthy()
    expect(screen.getByText("Dados Profissionais Tab")).toBeTruthy()
    expect(screen.getByText("Configuracoes Tab")).toBeTruthy()
  })

  it("should call onCancel when cancel button is clicked", () => {
    render(<DentistaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByText("Cancelar")
    act(() => {
      cancelButton.click()
    })

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it("should call onSubmit when form is submitted in create mode", () => {
    render(<DentistaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = screen.getByText("Cadastrar")
    act(() => {
      submitButton.click()
    })

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it("should call onSubmit when form is submitted in edit mode", () => {
    const dentista = {
      id: "1",
      nome: "Dr. Teste",
      cro: "CRO-TESTE",
      cpf: "123.456.789-00",
      email: "teste@clinica.com",
      especialidades: ["Clínico Geral"],
      status: "Ativo",
    } as Dentista

    render(<DentistaForm dentista={dentista} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = screen.getByText("Atualizar")
    act(() => {
      submitButton.click()
    })

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it("should pass dentista to useDentistaForm in edit mode", () => {
    const dentista = {
      id: "1",
      nome: "Dr. Teste",
      cro: "CRO-TESTE",
      cpf: "123.456.789-00",
      email: "teste@clinica.com",
      especialidades: ["Clínico Geral"],
      status: "Ativo",
    } as Dentista

    render(<DentistaForm dentista={dentista} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(mockUseDentistaForm).toHaveBeenCalledWith({
      dentista,
      onSubmit: mockOnSubmit,
    })
  })

  it("should pass undefined dentista to useDentistaForm in create mode", () => {
    render(<DentistaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(mockUseDentistaForm).toHaveBeenCalledWith({
      dentista: undefined,
      onSubmit: mockOnSubmit,
    })
  })

  it("should set default tab to pessoais", () => {
    render(<DentistaForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const tabs = screen.getByTestId("tabs")
    expect(tabs.getAttribute("data-default")).toBe("pessoais")
  })
})
