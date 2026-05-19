import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ clinicId: "clinic-1" }),
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

import { usePatientsUnified, usePatients } from "../usePatientsUnified"

describe("usePatientsUnified", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPut.mockReset()
    mockDelete.mockReset()
  })

  it("should delegate to usePatientsAPI and return the same interface", async () => {
    mockGet.mockResolvedValueOnce({
      patients: [
        { id: "p1", fullName: "João Silva", status: "ativo", phone: "11999999999" },
      ],
    })

    const { result } = renderHook(() => usePatientsUnified())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.patients).toHaveLength(1)
    expect(result.current.patients[0].full_name).toBe("João Silva")
    expect(typeof result.current.addPatient).toBe("function")
    expect(typeof result.current.updatePatient).toBe("function")
    expect(typeof result.current.deletePatient).toBe("function")
    expect(typeof result.current.getPatient).toBe("function")
    expect(typeof result.current.reloadPatients).toBe("function")
  })

  it("usePatients alias should also work", async () => {
    mockGet.mockResolvedValueOnce({
      patients: [
        { id: "p2", fullName: "Maria Souza", status: "ativo", phone: "11888888888" },
      ],
    })

    const { result } = renderHook(() => usePatients())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.patients).toHaveLength(1)
    expect(result.current.patients[0].full_name).toBe("Maria Souza")
  })

  it("should perform addPatient through the unified hook", async () => {
    mockGet.mockResolvedValueOnce({ patients: [] })
    mockPost.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce({
      patients: [{ id: "p3", fullName: "Novo", status: "ativo" }],
    })

    const { result } = renderHook(() => usePatientsUnified())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addPatient({ full_name: "Novo" })
    })

    expect(mockPost).toHaveBeenCalledWith("/pacientes", expect.any(Object))
  })
})
