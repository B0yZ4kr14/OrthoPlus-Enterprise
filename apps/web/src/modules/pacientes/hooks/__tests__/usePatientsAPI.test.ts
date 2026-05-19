import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null } = { clinicId: "clinic-1" }

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

vi.mock("@/lib/adapters/patientAdapter", () => ({
  PatientAdapter: {
    toFrontendList: (data: unknown[]) =>
      data.map((p: any) => ({
        id: p.id,
        full_name: p.fullName,
        cpf: p.cpf || null,
        phone_primary: p.phone || "",
        status: p.status || "ativo",
        risk_level: "baixo",
        risk_score_overall: 0,
        clinic_id: "clinic-1",
        birth_date: "",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      })),
    toAPI: (data: any) => data,
  },
}))

import { toast } from "sonner"
import { usePatientsAPI } from "../usePatientsAPI"

describe("usePatientsAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPut.mockReset()
    mockDelete.mockReset()
    authState.clinicId = "clinic-1"
  })

  // ─────────────────────────────────────────────────────────────
  // loadPatients
  // ─────────────────────────────────────────────────────────────

  it("should load patients on mount", async () => {
    mockGet.mockResolvedValueOnce({
      patients: [
        { id: "p1", fullName: "João Silva", status: "ativo", phone: "11999999999" },
        { id: "p2", fullName: "Maria Souza", status: "inativo", phone: "11888888888" },
      ],
    })

    const { result } = renderHook(() => usePatientsAPI())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.patients).toHaveLength(2)
    expect(result.current.patients[0].full_name).toBe("João Silva")
    expect(mockGet).toHaveBeenCalledWith("/pacientes")
  })

  it("should set loading to false when clinicId is null", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => usePatientsAPI())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.patients).toHaveLength(0)
  })

  it("should show toast.error when loading patients fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => usePatientsAPI())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao carregar pacientes"),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // addPatient
  // ─────────────────────────────────────────────────────────────

  it("should add a patient and reload patients", async () => {
    mockGet.mockResolvedValueOnce({ patients: [] })
    mockPost.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce({
      patients: [{ id: "p1", fullName: "Novo Paciente", status: "ativo" }],
    })

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addPatient({ full_name: "Novo Paciente" })
    })

    expect(mockPost).toHaveBeenCalledWith("/pacientes", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Paciente cadastrado com sucesso!")
    await waitFor(() => expect(result.current.patients).toHaveLength(1))
  })

  it("should show toast.error when clinicId is null on addPatient", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addPatient({ full_name: "Novo" })
    })

    expect(toast.error).toHaveBeenCalledWith("Nenhuma clínica selecionada")
  })

  it("should throw error and show toast on addPatient failure", async () => {
    mockGet.mockResolvedValueOnce({ patients: [] })
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.addPatient({ full_name: "Novo" })
      }),
    ).rejects.toThrow("Save failed")

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao cadastrar paciente"),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // updatePatient
  // ─────────────────────────────────────────────────────────────

  it("should update a patient and reload patients", async () => {
    mockGet.mockResolvedValueOnce({ patients: [] })
    mockPut.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce({
      patients: [{ id: "p1", fullName: "Atualizado", status: "ativo" }],
    })

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updatePatient("p1", { full_name: "Atualizado" })
    })

    expect(mockPut).toHaveBeenCalledWith("/pacientes/p1", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Paciente atualizado com sucesso!")
  })

  it("should throw error and show toast on updatePatient failure", async () => {
    mockGet.mockResolvedValueOnce({ patients: [] })
    mockPut.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.updatePatient("p1", { full_name: "Atualizado" })
      }),
    ).rejects.toThrow("Update failed")

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao atualizar paciente"),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // deletePatient
  // ─────────────────────────────────────────────────────────────

  it("should delete a patient and reload patients", async () => {
    mockGet.mockResolvedValueOnce({
      patients: [{ id: "p1", fullName: "João", status: "ativo" }],
    })
    mockDelete.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce({ patients: [] })

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deletePatient("p1")
    })

    expect(mockDelete).toHaveBeenCalledWith("/pacientes/p1")
    expect(toast.success).toHaveBeenCalledWith("Paciente removido com sucesso!")
  })

  it("should throw error and show toast on deletePatient failure", async () => {
    mockGet.mockResolvedValueOnce({ patients: [] })
    mockDelete.mockRejectedValueOnce(new Error("Delete failed"))

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.deletePatient("p1")
      }),
    ).rejects.toThrow("Delete failed")

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao remover paciente"),
    )
  })

  // ─────────────────────────────────────────────────────────────
  // getPatient
  // ─────────────────────────────────────────────────────────────

  it("should get a patient by id from loaded patients", async () => {
    mockGet.mockResolvedValueOnce({
      patients: [
        { id: "p1", fullName: "João Silva", status: "ativo", phone: "11999999999" },
      ],
    })

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const patient = result.current.getPatient("p1")
    expect(patient).toBeDefined()
    expect(patient?.full_name).toBe("João Silva")

    const notFound = result.current.getPatient("p999")
    expect(notFound).toBeUndefined()
  })

  // ─────────────────────────────────────────────────────────────
  // reloadPatients
  // ─────────────────────────────────────────────────────────────

  it("should reload patients when reloadPatients is called", async () => {
    mockGet.mockResolvedValueOnce({ patients: [] })
    mockGet.mockResolvedValueOnce({
      patients: [{ id: "p1", fullName: "Recarregado", status: "ativo" }],
    })

    const { result } = renderHook(() => usePatientsAPI())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.reloadPatients()
    })

    expect(mockGet).toHaveBeenCalledTimes(2)
    expect(result.current.patients).toHaveLength(1)
    expect(result.current.patients[0].full_name).toBe("Recarregado")
  })
})
