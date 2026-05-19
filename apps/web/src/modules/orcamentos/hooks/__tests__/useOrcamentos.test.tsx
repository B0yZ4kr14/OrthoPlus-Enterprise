import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

// DI container mocks
const mockFindByClinicId = vi.fn()
const mockFindPendentes = vi.fn()
const mockFindExpirados = vi.fn()
const mockFindById = vi.fn()
const mockFindByPatientId = vi.fn()

const mockCreateExecute = vi.fn()
const mockUpdateExecute = vi.fn()
const mockAprovarExecute = vi.fn()
const mockRejeitarExecute = vi.fn()

vi.mock("@/infrastructure/di/Container", () => ({
  container: {
    resolve: vi.fn((key: string) => {
      if (key === "IOrcamentoRepository") {
        return {
          findByClinicId: mockFindByClinicId,
          findPendentes: mockFindPendentes,
          findExpirados: mockFindExpirados,
          findById: mockFindById,
          findByPatientId: mockFindByPatientId,
        }
      }
      if (key === "CreateOrcamentoUseCase") {
        return { execute: mockCreateExecute }
      }
      if (key === "UpdateOrcamentoUseCase") {
        return { execute: mockUpdateExecute }
      }
      if (key === "AprovarOrcamentoUseCase") {
        return { execute: mockAprovarExecute }
      }
      if (key === "RejeitarOrcamentoUseCase") {
        return { execute: mockRejeitarExecute }
      }
      return {}
    }),
  },
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { useOrcamentos } from "../useOrcamentos"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockOrcamento = {
  id: "orc-1",
  numeroOrcamento: "ORC-001",
  clinicId: "clinic-1",
  patientId: "patient-1",
  createdBy: "user-1",
  titulo: "Tratamento 1",
  descricao: "Desc",
  tipoPlano: "BASICO",
  validadeDias: 30,
  dataExpiracao: new Date("2025-06-18"),
  status: "RASCUNHO" as const,
  valorSubtotal: 5000,
  descontoPercentual: 0,
  descontoValor: 0,
  valorTotal: 5000,
  observacoes: "",
  convertidoContrato: false,
  createdAt: new Date("2025-05-19"),
  updatedAt: new Date("2025-05-19"),
}

describe("useOrcamentos (react-query)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindByClinicId.mockReset()
    mockFindPendentes.mockReset()
    mockFindExpirados.mockReset()
    mockFindById.mockReset()
    mockFindByPatientId.mockReset()
    mockCreateExecute.mockReset()
    mockUpdateExecute.mockReset()
    mockAprovarExecute.mockReset()
    mockRejeitarExecute.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch orcamentos on mount", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.orcamentos).toHaveLength(1)
    expect(result.current.orcamentos[0].titulo).toBe("Tratamento 1")
    expect(mockFindByClinicId).toHaveBeenCalledWith("clinic-1")
  })

  it("should not fetch when clinicId is empty", async () => {
    const { result } = renderHook(() => useOrcamentos(""), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.orcamentos).toHaveLength(0)
    expect(mockFindByClinicId).not.toHaveBeenCalled()
  })

  it("should fetch pendentes and expirados", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])
    mockFindPendentes.mockResolvedValueOnce([
      { ...mockOrcamento, id: "orc-2", status: "PENDENTE" },
    ])
    mockFindExpirados.mockResolvedValueOnce([
      { ...mockOrcamento, id: "orc-3", status: "EXPIRADO" },
    ])

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.orcamentosPendentes).toHaveLength(1)
    expect(result.current.orcamentosPendentes[0].status).toBe("PENDENTE")
    expect(result.current.orcamentosExpirados).toHaveLength(1)
    expect(result.current.orcamentosExpirados[0].status).toBe("EXPIRADO")
  })

  it("should fetch orcamento by id when selected", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])
    mockFindById.mockResolvedValueOnce({ ...mockOrcamento, id: "orc-2" })

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setSelectedOrcamentoId("orc-2")
    })

    await waitFor(() =>
      expect(result.current.selectedOrcamento).toEqual(
        expect.objectContaining({ id: "orc-2" }),
      ),
    )
    expect(mockFindById).toHaveBeenCalledWith("orc-2")
  })

  // ─────────────────────────────────────────────────────────────
  // CRUD operations
  // ─────────────────────────────────────────────────────────────

  it("should create an orcamento via mutation", async () => {
    mockFindByClinicId.mockResolvedValueOnce([])
    mockCreateExecute.mockResolvedValueOnce({ orcamento: { ...mockOrcamento, id: "orc-new" } })

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createOrcamento({
        clinicId: "clinic-1",
        patientId: "patient-1",
        createdBy: "user-1",
        titulo: "Novo",
        tipoPlano: "BASICO",
        validadeDias: 30,
        valorSubtotal: 3000,
      } as any)
    })

    await waitFor(() => expect(result.current.isCreating).toBe(false))
    expect(mockCreateExecute).toHaveBeenCalled()
  })

  it("should update an orcamento via mutation", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])
    mockUpdateExecute.mockResolvedValueOnce({ orcamento: mockOrcamento })

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateOrcamento({
        orcamentoId: "orc-1",
        valorSubtotal: 4000,
      } as any)
    })

    await waitFor(() => expect(result.current.isUpdating).toBe(false))
    expect(mockUpdateExecute).toHaveBeenCalledWith({
      orcamentoId: "orc-1",
      valorSubtotal: 4000,
    })
  })

  it("should aprovar an orcamento via mutation", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])
    mockAprovarExecute.mockResolvedValueOnce({ orcamento: { ...mockOrcamento, status: "APROVADO" } })

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.aprovarOrcamento({
        orcamentoId: "orc-1",
        aprovadoPor: "user-1",
      })
    })

    await waitFor(() => expect(result.current.isAprovando).toBe(false))
    expect(mockAprovarExecute).toHaveBeenCalledWith({
      orcamentoId: "orc-1",
      aprovadoPor: "user-1",
    })
  })

  it("should rejeitar an orcamento via mutation", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])
    mockRejeitarExecute.mockResolvedValueOnce({
      orcamento: { ...mockOrcamento, status: "REJEITADO" },
    })

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.rejeitarOrcamento({
        orcamentoId: "orc-1",
        rejeitadoPor: "user-1",
        motivo: "Preço alto",
      })
    })

    await waitFor(() => expect(result.current.isRejeitando).toBe(false))
    expect(mockRejeitarExecute).toHaveBeenCalledWith({
      orcamentoId: "orc-1",
      rejeitadoPor: "user-1",
      motivo: "Preço alto",
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Query helpers
  // ─────────────────────────────────────────────────────────────

  it("should get orcamentos by patient via fetchQuery", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])
    mockFindByPatientId.mockResolvedValueOnce([
      { ...mockOrcamento, patientId: "patient-2" },
    ])

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let patientOrcamentos: any[] = []
    await act(async () => {
      patientOrcamentos = await result.current.getOrcamentosByPatient("patient-2")
    })

    expect(patientOrcamentos).toHaveLength(1)
    expect(mockFindByPatientId).toHaveBeenCalledWith("patient-2", "clinic-1")
  })

  it("should return empty array when patientId is empty", async () => {
    mockFindByClinicId.mockResolvedValueOnce([mockOrcamento])

    const { result } = renderHook(() => useOrcamentos("clinic-1"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const patientOrcamentos = await result.current.getOrcamentosByPatient("")

    expect(patientOrcamentos).toHaveLength(0)
    expect(mockFindByPatientId).not.toHaveBeenCalled()
  })
})
