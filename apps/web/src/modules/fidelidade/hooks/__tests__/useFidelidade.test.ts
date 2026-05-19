import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

// Mutable auth state so individual tests can change clinic/user
const authState: {
  user: { id: string; email: string } | null
  selectedClinic: { id: string; name: string } | null
} = {
  user: { id: "user-1", email: "test@example.com" },
  selectedClinic: { id: "clinic-1", name: "Clinica Teste" },
}

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

import { toast } from "sonner"
import { useFidelidade } from "../useFidelidade"

const mockConfig = {
  id: "config-1",
  clinic_id: "clinic-1",
  pontos_por_consulta: 10,
  pontos_por_real: 1,
  pontos_indicacao: 50,
  ativo: true,
}

const mockPontos = [
  {
    id: "pontos-1",
    clinic_id: "clinic-1",
    patient_id: "patient-1",
    pontos_disponiveis: 100,
    pontos_totais: 200,
    nivel: "OURO",
    patient_name: "Joao Silva",
  },
]

const mockRecompensas = [
  {
    id: "recompensa-1",
    clinic_id: "clinic-1",
    nome: "Limpeza Gratis",
    descricao: "Limpeza gratuita",
    pontos_necessarios: 100,
    tipo: "PROCEDIMENTO_GRATIS",
    ativo: true,
  },
]

const mockBadges = [
  {
    id: "badge-1",
    clinic_id: "clinic-1",
    nome: "Paciente VIP",
    descricao: "Badge VIP",
    icone: "🏆",
    criterio: { pontos_totais: 500 },
    compartilhavel: true,
  },
]

const mockIndicacoes = [
  {
    id: "indicacao-1",
    clinic_id: "clinic-1",
    indicador_id: "patient-1",
    indicado_nome: "Maria Souza",
    indicado_telefone: "(11) 99999-9999",
    status: "PENDENTE",
  },
]

function setupLoadDataMocks() {
  mockGet.mockResolvedValueOnce(mockConfig)
  mockGet.mockResolvedValueOnce(mockPontos)
  mockGet.mockResolvedValueOnce(mockRecompensas)
  mockGet.mockResolvedValueOnce(mockBadges)
  mockGet.mockResolvedValueOnce(mockIndicacoes)
}

describe("useFidelidade", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPut.mockReset()
    mockDelete.mockReset()
    authState.user = { id: "user-1", email: "test@example.com" }
    authState.selectedClinic = { id: "clinic-1", name: "Clinica Teste" }
  })

  // ─────────────────────────────────────────────────────────────
  // loadData / initial state
  // ─────────────────────────────────────────────────────────────

  it("should load fidelidade data on mount", async () => {
    setupLoadDataMocks()

    const { result } = renderHook(() => useFidelidade())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.config).toEqual(mockConfig)
    expect(result.current.pontos).toHaveLength(1)
    expect(result.current.pontos[0].patient_name).toBe("Joao Silva")
    expect(result.current.recompensas).toHaveLength(1)
    expect(result.current.recompensas[0].nome).toBe("Limpeza Gratis")
    expect(result.current.badges).toHaveLength(1)
    expect(result.current.badges[0].nome).toBe("Paciente VIP")
    expect(result.current.indicacoes).toHaveLength(1)
    expect(result.current.indicacoes[0].indicado_nome).toBe("Maria Souza")

    expect(mockGet).toHaveBeenCalledWith("/fidelidade/config")
    expect(mockGet).toHaveBeenCalledWith("/fidelidade/pontos", {
      params: { sort: "created_at.desc" },
    })
    expect(mockGet).toHaveBeenCalledWith("/fidelidade/recompensas", {
      params: { sort: "pontos_necessarios.asc" },
    })
    expect(mockGet).toHaveBeenCalledWith("/fidelidade/badges", {
      params: { sort: "created_at.desc" },
    })
    expect(mockGet).toHaveBeenCalledWith("/fidelidade/indicacoes", {
      params: { sort: "created_at.desc" },
    })
  })

  it("should not fetch data when selectedClinic is null", async () => {
    authState.selectedClinic = null

    const { result } = renderHook(() => useFidelidade())

    // loadData returns early when selectedClinic is null, so loading stays true
    expect(result.current.loading).toBe(true)
    expect(mockGet).not.toHaveBeenCalled()
    expect(result.current.config).toBeNull()
    expect(result.current.pontos).toHaveLength(0)
  })

  it("should show toast.error when loading data fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useFidelidade())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar dados de fidelidade")
  })

  it("should reload data when loadData is called explicitly", async () => {
    setupLoadDataMocks()
    setupLoadDataMocks()

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.loadData()
    })

    expect(mockGet).toHaveBeenCalledTimes(10)
    expect(result.current.config).toEqual(mockConfig)
  })

  // ─────────────────────────────────────────────────────────────
  // createOrUpdateConfig
  // ─────────────────────────────────────────────────────────────

  it("should create config when no existing config", async () => {
    setupLoadDataMocks()
    // Override config to null for this test
    mockGet.mockReset()
    mockGet
      .mockResolvedValueOnce(null) // config
      .mockResolvedValueOnce(mockPontos)
      .mockResolvedValueOnce(mockRecompensas)
      .mockResolvedValueOnce(mockBadges)
      .mockResolvedValueOnce(mockIndicacoes)

    // After create, loadData runs again
    setupLoadDataMocks()

    mockPost.mockResolvedValueOnce({ id: "config-new", ...mockConfig })

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newConfig = {
      clinic_id: "clinic-1",
      pontos_por_consulta: 20,
      pontos_por_real: 2,
      pontos_indicacao: 100,
      ativo: true,
    }

    await act(async () => {
      await result.current.createOrUpdateConfig(newConfig)
    })

    expect(mockPost).toHaveBeenCalledWith("/fidelidade/config", newConfig)
    expect(toast.success).toHaveBeenCalledWith("Configuração criada com sucesso!")
  })

  it("should update config when existing config has id", async () => {
    setupLoadDataMocks()
    // After update, loadData runs again
    setupLoadDataMocks()

    mockPut.mockResolvedValueOnce({ ...mockConfig, pontos_por_consulta: 25 })

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const updatedConfig = {
      ...mockConfig,
      pontos_por_consulta: 25,
    }

    await act(async () => {
      await result.current.createOrUpdateConfig(updatedConfig)
    })

    expect(mockPut).toHaveBeenCalledWith("/fidelidade/config", updatedConfig)
    expect(toast.success).toHaveBeenCalledWith("Configuração atualizada com sucesso!")
  })

  it("should show toast.error when user is not authenticated on createOrUpdateConfig", async () => {
    setupLoadDataMocks()
    authState.user = null

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createOrUpdateConfig({ ativo: true })
    })

    expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado")
    expect(mockPost).not.toHaveBeenCalled()
    expect(mockPut).not.toHaveBeenCalled()
  })

  it("should show toast.error when selectedClinic is null on createOrUpdateConfig", async () => {
    setupLoadDataMocks()
    authState.selectedClinic = null

    const { result } = renderHook(() => useFidelidade())

    await act(async () => {
      await result.current.createOrUpdateConfig({ ativo: true })
    })

    expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado")
    expect(mockPost).not.toHaveBeenCalled()
  })

  it("should show toast.error on createOrUpdateConfig failure", async () => {
    setupLoadDataMocks()
    mockPut.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createOrUpdateConfig(mockConfig)
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao salvar configuração")
  })

  // ─────────────────────────────────────────────────────────────
  // createRecompensa
  // ─────────────────────────────────────────────────────────────

  it("should create a recompensa and reload data", async () => {
    setupLoadDataMocks()
    setupLoadDataMocks()

    mockPost.mockResolvedValueOnce({ id: "recompensa-new", ...mockRecompensas[0] })

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newRecompensa = {
      nome: "Clareamento Gratis",
      descricao: "Clareamento dental gratis",
      pontos_necessarios: 500,
      tipo: "PROCEDIMENTO_GRATIS",
      ativo: true,
    }

    await act(async () => {
      await result.current.createRecompensa(newRecompensa)
    })

    expect(mockPost).toHaveBeenCalledWith("/fidelidade/recompensas", newRecompensa)
    expect(toast.success).toHaveBeenCalledWith("Recompensa criada com sucesso!")
  })

  it("should show toast.error when user is not authenticated on createRecompensa", async () => {
    setupLoadDataMocks()
    authState.user = null

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createRecompensa({ nome: "Test" })
    })

    expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado")
    expect(mockPost).not.toHaveBeenCalled()
  })

  it("should show toast.error on createRecompensa failure", async () => {
    setupLoadDataMocks()
    mockPost.mockRejectedValueOnce(new Error("Create failed"))

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createRecompensa({ nome: "Test" })
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar recompensa")
  })

  // ─────────────────────────────────────────────────────────────
  // updateRecompensa
  // ─────────────────────────────────────────────────────────────

  it("should update a recompensa and reload data", async () => {
    setupLoadDataMocks()
    setupLoadDataMocks()

    mockPut.mockResolvedValueOnce({ ...mockRecompensas[0], nome: "Limpeza Atualizada" })

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const updated = { ...mockRecompensas[0], nome: "Limpeza Atualizada" }

    await act(async () => {
      await result.current.updateRecompensa("recompensa-1", updated)
    })

    expect(mockPut).toHaveBeenCalledWith("/fidelidade/recompensas/recompensa-1", updated)
    expect(toast.success).toHaveBeenCalledWith("Recompensa atualizada com sucesso!")
  })

  it("should show toast.error when user is not authenticated on updateRecompensa", async () => {
    setupLoadDataMocks()
    authState.user = null

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateRecompensa("recompensa-1", {})
    })

    expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado")
    expect(mockPut).not.toHaveBeenCalled()
  })

  it("should show toast.error on updateRecompensa failure", async () => {
    setupLoadDataMocks()
    mockPut.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateRecompensa("recompensa-1", {})
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar recompensa")
  })

  // ─────────────────────────────────────────────────────────────
  // deleteRecompensa
  // ─────────────────────────────────────────────────────────────

  it("should delete a recompensa and reload data", async () => {
    setupLoadDataMocks()
    setupLoadDataMocks()

    mockDelete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteRecompensa("recompensa-1")
    })

    expect(mockDelete).toHaveBeenCalledWith("/fidelidade/recompensas/recompensa-1")
    expect(toast.success).toHaveBeenCalledWith("Recompensa excluída com sucesso!")
  })

  it("should show toast.error when user is not authenticated on deleteRecompensa", async () => {
    setupLoadDataMocks()
    authState.user = null

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteRecompensa("recompensa-1")
    })

    expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado")
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("should show toast.error on deleteRecompensa failure", async () => {
    setupLoadDataMocks()
    mockDelete.mockRejectedValueOnce(new Error("Delete failed"))

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteRecompensa("recompensa-1")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao excluir recompensa")
  })

  // ─────────────────────────────────────────────────────────────
  // createBadge
  // ─────────────────────────────────────────────────────────────

  it("should create a badge and reload data", async () => {
    setupLoadDataMocks()
    setupLoadDataMocks()

    mockPost.mockResolvedValueOnce({ id: "badge-new", ...mockBadges[0] })

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newBadge = {
      nome: "Paciente Diamante",
      descricao: "Badge diamante",
      icone: "💎",
      criterio: { pontos_totais: 1000 },
      compartilhavel: true,
    }

    await act(async () => {
      await result.current.createBadge(newBadge)
    })

    expect(mockPost).toHaveBeenCalledWith("/fidelidade/badges", newBadge)
    expect(toast.success).toHaveBeenCalledWith("Badge criada com sucesso!")
  })

  it("should show toast.error when user is not authenticated on createBadge", async () => {
    setupLoadDataMocks()
    authState.user = null

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createBadge({ nome: "Test" })
    })

    expect(toast.error).toHaveBeenCalledWith("Usuário não autenticado")
    expect(mockPost).not.toHaveBeenCalled()
  })

  it("should show toast.error on createBadge failure", async () => {
    setupLoadDataMocks()
    mockPost.mockRejectedValueOnce(new Error("Create failed"))

    const { result } = renderHook(() => useFidelidade())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createBadge({ nome: "Test" })
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar badge")
  })
})
