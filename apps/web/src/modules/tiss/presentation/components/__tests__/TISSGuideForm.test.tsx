import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TISSGuideForm } from "../TISSGuideForm"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

vi.mock("@/hooks/api/usePacientes", () => ({
  usePacientes: () => ({
    patients: [
      { id: "p1", nome: "João Silva" },
      { id: "p2", nome: "Maria Santos" },
      { id: "p3", nome: "Pedro Costa" },
    ],
    isLoading: false,
  }),
}))

vi.mock("@/modules/tiss/application/hooks/useTISSConvenios", () => ({
  useTISSConvenios: () => ({
    convenios: [
      { id: "c1", nome: "Unimed", is_active: true },
      { id: "c2", nome: "Bradesco Saúde", is_active: true },
      { id: "c3", nome: "Amil", is_active: true },
    ],
    isLoading: false,
  }),
}))

vi.mock("@/modules/procedimentos/hooks/useProcedimentosStore", () => ({
  useProcedimentosStore: () => ({
    procedimentos: [
      { id: "pr1", codigo: "81000030", nome: "Consulta", valor: 150 },
      { id: "pr2", codigo: "82000107", nome: "Limpeza", valor: 200 },
      { id: "pr3", codigo: "83000018", nome: "Restauração", valor: 300 },
    ],
  }),
}))

vi.mock("@/modules/tiss/application/hooks/useTISSGuides", () => ({
  useTISSGuides: () => ({
    createGuide: vi.fn(),
    isCreating: false,
  }),
}))

describe("TISSGuideForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithQueryClient = (ui: React.ReactElement) =>
    render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)

  it("should render form title and description", () => {
    renderWithQueryClient(<TISSGuideForm />)
    expect(screen.getByText("Nova Guia TISS")).toBeTruthy()
    expect(screen.getByText("Preencha os dados da guia de atendimento")).toBeTruthy()
  })

  it("should render patient select", () => {
    renderWithQueryClient(<TISSGuideForm />)
    expect(screen.getByText("Paciente")).toBeTruthy()
  })

  it("should render insurance select", () => {
    renderWithQueryClient(<TISSGuideForm />)
    expect(screen.getByText("Convênio")).toBeTruthy()
  })

  it("should render guide number input", () => {
    renderWithQueryClient(<TISSGuideForm />)
    expect(screen.getByText("Número da Guia")).toBeTruthy()
    expect(screen.getByPlaceholderText("2025110001")).toBeTruthy()
  })

  it("should render procedure select", () => {
    renderWithQueryClient(<TISSGuideForm />)
    expect(screen.getByText("Procedimento")).toBeTruthy()
  })

  it("should render cancel and save buttons", () => {
    renderWithQueryClient(<TISSGuideForm />)
    expect(screen.getByText("Cancelar")).toBeTruthy()
    expect(screen.getByText("Salvar Guia")).toBeTruthy()
  })
})
