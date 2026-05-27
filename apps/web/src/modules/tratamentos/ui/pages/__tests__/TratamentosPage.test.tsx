import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import type { ReactNode } from "react"
import { TratamentosPage } from "../TratamentosPage"

const mockUpdateStatus = vi.fn()
const mockCreateTratamento = vi.fn()
const mockRefresh = vi.fn()

vi.mock("@/modules/pep/hooks/useTratamentos", () => ({
  useTratamentos: vi.fn(),
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1", user: null }),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/components/shared/PatientSelector", () => ({
  PatientSelector: ({ onSelect }: { onSelect: (patient: { id: string; nome: string }) => void }) => (
    <button data-testid="select-patient" onClick={() => onSelect({ id: "p1", nome: "Joao Silva" })}>
      Selecionar Paciente
    </button>
  ),
}))

vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}))

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, size, variant, ...props }: {
    children?: ReactNode
    onClick?: () => void
    size?: string
    variant?: string
  } & Record<string, unknown>) => (
    <button onClick={onClick} data-size={size} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children, className }: { children?: ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardDescription: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children, className }: { children?: ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: { children?: ReactNode; className?: string }) => <div className={className}>{children}</div>,
}))

vi.mock("@orthoplus/core-ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: { children?: ReactNode; defaultValue?: string }) => <div data-default-tab={defaultValue}>{children}</div>,
  TabsList: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children?: ReactNode; value: string }) => <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({ children, value, className }: { children?: ReactNode; value: string; className?: string }) => (
    <div data-tab={value} className={className}>{children}</div>
  ),
}))

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant, className }: { children?: ReactNode; variant?: string; className?: string }) => (
    <span data-variant={variant} className={className}>{children}</span>
  ),
}))

vi.mock("@orthoplus/core-ui/alert", () => ({
  Alert: ({ children }: { children?: ReactNode }) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
}))

vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react")
  return {
    ...actual,
    ClipboardPlus: () => <span data-icon="clipboard-plus">Icon</span>,
    Plus: () => <span>Plus</span>,
    Clock: () => <span>Clock</span>,
    CheckCircle: () => <span>CheckCircle</span>,
    XCircle: () => <span>XCircle</span>,
    Pause: () => <span>Pause</span>,
    AlertCircle: () => <span>AlertCircle</span>,
  }
})

import { useTratamentos } from "@/modules/pep/hooks/useTratamentos"

const mockUseTratamentos = vi.mocked(useTratamentos)

const mockTratamentos = [
  {
    id: "t1",
    descricao: "Limpeza e profilaxia",
    status: "PLANEJADO",
    denteCodigo: "18",
    procedimentoId: "proc-1",
    dataInicio: "2024-01-15",
  },
  {
    id: "t2",
    descricao: "Restauracao em resina",
    status: "EM_ANDAMENTO",
    denteCodigo: "36",
    procedimentoId: "proc-2",
    dataInicio: "2024-02-01",
  },
  {
    id: "t3",
    descricao: "Extracao do siso",
    status: "CONCLUIDO",
    denteCodigo: "48",
    procedimentoId: "proc-3",
    dataInicio: "2023-12-10",
  },
]

describe("TratamentosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTratamentos.mockReturnValue({
      tratamentos: [],
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)
  })

  it("should render page header", () => {
    render(<TratamentosPage />)
    expect(screen.getByText("Planos de Tratamento")).toBeTruthy()
  })

  it("should show patient selector", () => {
    render(<TratamentosPage />)
    expect(screen.getByTestId("select-patient")).toBeTruthy()
  })

  it("should show alert when no patient is selected", () => {
    render(<TratamentosPage />)
    expect(
      screen.getByText(
        "Selecione um paciente para visualizar os planos de tratamento.",
      ),
    ).toBeTruthy()
  })

  it("should show loading state when patient is selected", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: [],
      isLoading: true,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    expect(screen.getByText("Carregando tratamentos...")).toBeTruthy()
  })

  it("should render tratamentos with correct tab counts", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: mockTratamentos,
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    expect(screen.getByTestId("tab-todos").textContent).toBe("Todos (3)")
    expect(screen.getByTestId("tab-planejados").textContent).toBe(
      "Planejados (1)",
    )
    expect(screen.getByTestId("tab-andamento").textContent).toBe(
      "Em Andamento (1)",
    )
    expect(screen.getByTestId("tab-concluidos").textContent).toBe(
      "Concluídos (1)",
    )
  })

  it("should render tratamento cards with data", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: mockTratamentos,
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    expect(screen.getAllByText("Limpeza e profilaxia").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Restauracao em resina").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Extracao do siso").length).toBeGreaterThanOrEqual(1)

    expect(screen.getAllByText("18").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("36").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("48").length).toBeGreaterThanOrEqual(1)
  })

  it("should show empty state for tabs with no items", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: [mockTratamentos[0]],
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    const emptyStates = screen.getAllByText(
      "Nenhum tratamento encontrado nesta categoria.",
    )
    expect(emptyStates.length).toBe(2)
  })

  it("should call updateStatus with iniciar when clicking Iniciar", async () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: [mockTratamentos[0]],
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    const iniciarButtons = screen.getAllByText("Iniciar")
    act(() => {
      iniciarButtons[0].click()
    })

    expect(mockUpdateStatus).toHaveBeenCalledTimes(1)
    expect(mockUpdateStatus).toHaveBeenCalledWith("t1", "iniciar")
  })

  it("should call updateStatus with concluir when clicking Concluir", async () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: [mockTratamentos[1]],
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    const concluirButtons = screen.getAllByText("Concluir")
    act(() => {
      concluirButtons[0].click()
    })

    expect(mockUpdateStatus).toHaveBeenCalledTimes(1)
    expect(mockUpdateStatus).toHaveBeenCalledWith("t2", "concluir")
  })

  it("should not show action buttons for CONCLUIDO tratamentos", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: [mockTratamentos[2]],
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    expect(screen.queryByText("Iniciar")).toBeNull()
    expect(screen.queryByText("Concluir")).toBeNull()
  })

  it("should render status badges for each tratamento", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: mockTratamentos,
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    expect(screen.getAllByText("PLANEJADO").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("EM ANDAMENTO").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("CONCLUIDO").length).toBeGreaterThanOrEqual(1)
  })

  it("should show procedimento count and data inicio", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: mockTratamentos,
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    const procedimentoTexts = screen.getAllByText("1 procedimento")
    expect(procedimentoTexts.length).toBeGreaterThanOrEqual(1)

    const inicioLabels = screen.getAllByText(/In\u00edcio:/i)
    expect(inicioLabels.length).toBeGreaterThanOrEqual(1)
  })

  it("should fallback to default title and dente text", () => {
    mockUseTratamentos.mockReturnValue({
      tratamentos: [
        {
          id: "t4",
          descricao: "",
          status: "PLANEJADO",
          denteCodigo: "",
          procedimentoId: null,
          dataInicio: null,
        },
      ],
      isLoading: false,
      createTratamento: mockCreateTratamento,
      updateStatus: mockUpdateStatus,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useTratamentos>)

    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    expect(screen.getAllByText("Plano de Tratamento").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Sem dente especificado").length).toBeGreaterThanOrEqual(1)
  })

  it("should pass patient id to useTratamentos when patient is selected", () => {
    render(<TratamentosPage />)

    act(() => {
      screen.getByTestId("select-patient").click()
    })

    expect(mockUseTratamentos).toHaveBeenCalledWith("p1", "clinic-1")
  })

  it("should pass null to useTratamentos when no patient is selected", () => {
    render(<TratamentosPage />)

    expect(mockUseTratamentos).toHaveBeenCalledWith(null, "clinic-1")
  })
})
