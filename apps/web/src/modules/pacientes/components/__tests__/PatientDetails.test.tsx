import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { PatientDetails } from "../PatientDetails"

const mockOnEdit = vi.fn()
const mockOnClose = vi.fn()

// Mock UI primitives that may use portal or complex rendering
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

function createMockPatient() {
  return {
    nome: "João Silva",
    status: "Ativo",
    createdAt: "2024-01-15T10:00:00Z",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    dataNascimento: "1990-05-15",
    sexo: "M",
    telefone: "(11) 3333-4444",
    celular: "(11) 99999-8888",
    email: "joao@test.com",
    endereco: {
      logradouro: "Rua das Flores",
      numero: "123",
      complemento: "Apto 45",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01000-000",
    },
    convenio: {
      temConvenio: true,
      nomeConvenio: "Unimed",
      numeroCarteira: "123456789",
      validade: "2025-12-31",
    },
    observacoes: "Paciente com histórico de alergia a penicilina.",
  }
}

function createMockPatientNoConvenio() {
  return {
    ...createMockPatient(),
    convenio: {
      temConvenio: false,
      nomeConvenio: "",
      numeroCarteira: "",
      validade: "",
    },
    rg: undefined,
    email: undefined,
    observacoes: undefined,
  }
}

describe("PatientDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render patient name and status badge", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText("João Silva")).toBeTruthy()
    expect(screen.getByText("Ativo")).toBeTruthy()
  })

  it("should render registration date", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText(/Cadastrado em/)).toBeTruthy()
  })

  it("should call onEdit when edit button is clicked", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    const editButton = screen.getByText("Editar")
    act(() => {
      editButton.click()
    })

    expect(mockOnEdit).toHaveBeenCalled()
  })

  it("should call onClose when close button is clicked", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    const closeButton = screen.getByText("Fechar")
    act(() => {
      closeButton.click()
    })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("should render dados cadastrais tab with personal info", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByTestId("tab-trigger-dados")).toBeTruthy()
    expect(screen.getByTestId("tab-content-dados")).toBeTruthy()
    expect(screen.getByText("Informações Pessoais")).toBeTruthy()
    expect(screen.getByText("123.456.789-00")).toBeTruthy()
    expect(screen.getByText("12.345.678-9")).toBeTruthy()
    expect(screen.getByText("Masculino")).toBeTruthy()
  })

  it("should render contact tab with phone and email", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByTestId("tab-trigger-dados")).toBeTruthy()
    expect(screen.getByText("Contato")).toBeTruthy()
    expect(screen.getByText("(11) 3333-4444")).toBeTruthy()
    expect(screen.getByText("(11) 99999-8888")).toBeTruthy()
    expect(screen.getByText("joao@test.com")).toBeTruthy()
  })

  it("should render address tab with full address", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText("Endereço")).toBeTruthy()
    expect(screen.getByText(/Rua das Flores, 123/)).toBeTruthy()
    expect(screen.getByText(/Apto 45/)).toBeTruthy()
    expect(screen.getByText(/Centro - São Paulo\/SP/)).toBeTruthy()
    expect(screen.getByText(/CEP: 01000-000/)).toBeTruthy()
  })

  it("should render convenio info when patient has convenio", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText("Convênio")).toBeTruthy()
    expect(screen.getByText("Unimed")).toBeTruthy()
    expect(screen.getByText("123456789")).toBeTruthy()
  })

  it("should render 'sem convenio' message when patient has no convenio", () => {
    const patient = createMockPatientNoConvenio()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText(/Paciente particular/)).toBeTruthy()
  })

  it("should render observacoes when present", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText("Paciente com histórico de alergia a penicilina.")).toBeTruthy()
  })

  it("should not render observacoes section when absent", () => {
    const patient = createMockPatientNoConvenio()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.queryByText("Paciente com histórico de alergia a penicilina.")).toBeNull()
  })

  it("should render consultas tab with mock data", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByTestId("tab-trigger-consultas")).toBeTruthy()
    expect(screen.getByTestId("tab-content-consultas")).toBeTruthy()
    expect(screen.getByText("Consultas Realizadas e Agendadas")).toBeTruthy()
    expect(screen.getByText("Limpeza")).toBeTruthy()
    expect(screen.getByText("Restauração")).toBeTruthy()
  })

  it("should render prontuario tab with mock data", () => {
    const patient = createMockPatient()
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByTestId("tab-trigger-prontuario")).toBeTruthy()
    expect(screen.getByTestId("tab-content-prontuario")).toBeTruthy()
    expect(screen.getByText("Prontuário Odontológico")).toBeTruthy()
    expect(screen.getByText("Anamnese")).toBeTruthy()
    expect(screen.getByText("Diagnóstico")).toBeTruthy()
  })

  it("should render female sexo correctly", () => {
    const patient = { ...createMockPatient(), sexo: "F" }
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText("Feminino")).toBeTruthy()
  })

  it("should render other sexo correctly", () => {
    const patient = { ...createMockPatient(), sexo: "O" }
    render(<PatientDetails patient={patient as any} onEdit={mockOnEdit} onClose={mockOnClose} />)

    expect(screen.getByText("Outro")).toBeTruthy()
  })
})
