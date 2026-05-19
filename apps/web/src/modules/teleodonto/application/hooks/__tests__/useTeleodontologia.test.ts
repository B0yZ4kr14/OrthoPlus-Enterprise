import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()
const mockToast = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}))

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}))

import { useTeleodontologia } from "../useTeleodontologia"

const mockTeleconsulta = {
  id: "tc-1",
  clinic_id: "clinic-1",
  patient_id: "patient-1",
  dentist_id: "dentist-1",
  titulo: "Consulta Inicial",
  tipo: "VIDEO",
  status: "AGENDADA",
  data_agendada: "2025-06-15T14:00:00",
  motivo: "Dor de dente",
  patient_name: "João Silva",
  dentist_name: "Dr. Ana Paula",
}

const mockPrescricao = {
  id: "pr-1",
  teleconsulta_id: "tc-1",
  tipo: "MEDICAMENTO",
  descricao: "Amoxicilina 500mg",
  medicamento_nome: "Amoxicilina",
  medicamento_dosagem: "500mg",
  medicamento_frequencia: "8/8h",
  medicamento_duracao: "7 dias",
  instrucoes: "Tomar após as refeições",
}

const mockTriagem = {
  id: "tr-1",
  teleconsulta_id: "tc-1",
  sintomas: ["Dor de dente", "Sensibilidade"],
  intensidade_dor: 7,
  tempo_sintoma: "3 dias",
  alergias: "Nenhuma",
  medicamentos_uso: "Nenhum",
}

describe("useTeleodontologia", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
    mockToast.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should load data on mount", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.teleconsultas).toHaveLength(1)
    expect(result.current.teleconsultas[0].titulo).toBe("Consulta Inicial")
    expect(result.current.prescricoes).toHaveLength(1)
    expect(result.current.prescricoes[0].descricao).toBe("Amoxicilina 500mg")
    expect(result.current.triagens).toHaveLength(1)
    expect(result.current.triagens[0].intensidade_dor).toBe(7)

    expect(mockGet).toHaveBeenCalledWith("/teleodonto/teleconsultas", {
      params: { include_details: true },
    })
    expect(mockGet).toHaveBeenCalledWith("/teleodonto/prescricoes")
    expect(mockGet).toHaveBeenCalledWith("/teleodonto/triagens")
  })

  it("should not load data when clinicId is empty", async () => {
    const { result } = renderHook(() => useTeleodontologia(""))

    // When clinicId is empty, the hook returns early from useEffect
    // and loading remains true (production behavior)
    expect(result.current.loading).toBe(true)
    expect(result.current.teleconsultas).toHaveLength(0)
    expect(result.current.prescricoes).toHaveLength(0)
    expect(result.current.triagens).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should show error toast when loading data fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro ao carregar dados",
        variant: "destructive",
      }),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // Create teleconsulta
  // ─────────────────────────────────────────────────────────────

  it("should create a teleconsulta and reload data", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockPost.mockResolvedValueOnce({ id: "tc-new", titulo: "Nova Consulta" })
    // reloadData calls
    mockGet.mockResolvedValueOnce([mockTeleconsulta, { ...mockTeleconsulta, id: "tc-new" }])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    const data = await act(async () => {
      return await result.current.createTeleconsulta({
        titulo: "Nova Consulta",
        tipo: "VIDEO",
        motivo: "Teste",
      })
    })

    expect(mockPost).toHaveBeenCalledWith(
      "/teleodonto/teleconsultas",
      expect.any(Object),
    )
    expect(data).toEqual(expect.objectContaining({ id: "tc-new" }))
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Teleconsulta criada com sucesso!",
      }),
    )
  })

  it("should show error toast when creating teleconsulta fails", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.createTeleconsulta({ titulo: "Falha" } as any)
      }),
    ).rejects.toThrow("Save failed")

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro",
        variant: "destructive",
      }),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // Update teleconsulta
  // ─────────────────────────────────────────────────────────────

  it("should update a teleconsulta and reload data", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockPatch.mockResolvedValueOnce({ ...mockTeleconsulta, status: "CONCLUIDA" })
    // reloadData
    mockGet.mockResolvedValueOnce([{ ...mockTeleconsulta, status: "CONCLUIDA" }])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    const data = await act(async () => {
      return await result.current.updateTeleconsulta("tc-1", {
        status: "CONCLUIDA",
      })
    })

    expect(mockPatch).toHaveBeenCalledWith(
      "/teleodonto/teleconsultas/tc-1",
      { status: "CONCLUIDA" },
    )
    expect(data).toEqual(expect.objectContaining({ status: "CONCLUIDA" }))
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Teleconsulta atualizada com sucesso!",
      }),
    )
  })

  it("should show error toast when updating teleconsulta fails", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockPatch.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.updateTeleconsulta("tc-1", { status: "CANCELADA" })
      }),
    ).rejects.toThrow("Update failed")

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro",
        variant: "destructive",
      }),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // Delete teleconsulta
  // ─────────────────────────────────────────────────────────────

  it("should delete a teleconsulta and reload data", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockDelete.mockResolvedValueOnce({})
    // reloadData
    mockGet.mockResolvedValueOnce([])
    mockGet.mockResolvedValueOnce([])
    mockGet.mockResolvedValueOnce([])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteTeleconsulta("tc-1")
    })

    expect(mockDelete).toHaveBeenCalledWith("/teleodonto/teleconsultas/tc-1")
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Teleconsulta excluída com sucesso!",
      }),
    )
  })

  it("should show error toast when deleting teleconsulta fails", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockDelete.mockRejectedValueOnce(new Error("Delete failed"))

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.deleteTeleconsulta("tc-1")
      }),
    ).rejects.toThrow("Delete failed")

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro",
        variant: "destructive",
      }),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // Create prescricao
  // ─────────────────────────────────────────────────────────────

  it("should create a prescricao and reload data", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockPost.mockResolvedValueOnce({ id: "pr-new", descricao: "Nova Prescrição" })
    // reloadData
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao, { id: "pr-new", descricao: "Nova Prescrição" }])
    mockGet.mockResolvedValueOnce([mockTriagem])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    const data = await act(async () => {
      return await result.current.createPrescricao({
        teleconsulta_id: "tc-1",
        tipo: "MEDICAMENTO",
        descricao: "Nova Prescrição",
      } as any)
    })

    expect(mockPost).toHaveBeenCalledWith(
      "/teleodonto/prescricoes",
      expect.any(Object),
    )
    expect(data).toEqual(expect.objectContaining({ id: "pr-new" }))
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Prescrição criada com sucesso!",
      }),
    )
  })

  it("should show error toast when creating prescricao fails", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.createPrescricao({ descricao: "Falha" } as any)
      }),
    ).rejects.toThrow("Save failed")

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro",
        variant: "destructive",
      }),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // Create triagem
  // ─────────────────────────────────────────────────────────────

  it("should create a triagem and reload data", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    mockPost.mockResolvedValueOnce({ id: "tr-new", sintomas: ["Febre"] })
    // reloadData
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem, { id: "tr-new", sintomas: ["Febre"] }])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    const data = await act(async () => {
      return await result.current.createTriagem({
        teleconsulta_id: "tc-1",
        sintomas: ["Febre"],
        intensidade_dor: 3,
        tempo_sintoma: "1 dia",
      } as any)
    })

    expect(mockPost).toHaveBeenCalledWith(
      "/teleodonto/triagens",
      expect.any(Object),
    )
    expect(data).toEqual(expect.objectContaining({ id: "tr-new" }))
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Triagem criada com sucesso!",
      }),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // Iniciar consulta
  // ─────────────────────────────────────────────────────────────

  it("should iniciar consulta and return video room data", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    const data = await act(async () => {
      return await result.current.iniciarConsulta("tc-1")
    })

    expect(data).toEqual({
      token: "mock-token",
      appId: "mock-app-id",
      channelName: "teleconsulta-tc-1",
      uid: "user-1",
      teleconsultaId: "tc-1",
    })
  })

  // ─────────────────────────────────────────────────────────────
  // Refresh
  // ─────────────────────────────────────────────────────────────

  it("should refresh data when refresh is called", async () => {
    mockGet.mockResolvedValueOnce([mockTeleconsulta])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])
    // refresh calls
    mockGet.mockResolvedValueOnce([{ ...mockTeleconsulta, status: "CONCLUIDA" }])
    mockGet.mockResolvedValueOnce([mockPrescricao])
    mockGet.mockResolvedValueOnce([mockTriagem])

    const { result } = renderHook(() => useTeleodontologia("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.refresh()
    })

    expect(mockGet).toHaveBeenCalledTimes(6)
    expect(result.current.teleconsultas[0].status).toBe("CONCLUIDA")
  })
})
