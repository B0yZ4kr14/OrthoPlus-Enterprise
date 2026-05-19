import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useDentistasStore } from "../useDentistasStore"

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("useDentistasStore", () => {
  let storage: Record<string, string> = {}

  beforeEach(() => {
    vi.clearAllMocks()
    storage = {}
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
      clear: () => {
        Object.keys(storage).forEach((k) => delete storage[k])
      },
      get length() {
        return Object.keys(storage).length
      },
      key: (index: number) => Object.keys(storage)[index] || null,
    })
    vi.spyOn(Date, "now").mockReturnValue(1700000000000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should initialize with loading false and default mock data after mount", async () => {
    const { result } = renderHook(() => useDentistasStore())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.dentistas).toHaveLength(3)
    expect(result.current.dentistas[0].nome).toBe("Dr. Carlos Silva")
    expect(result.current.dentistas[1].nome).toBe("Dra. Ana Santos")
    expect(result.current.dentistas[2].nome).toBe("Dr. Pedro Costa")
  })

  it("should load dentistas from localStorage if available", async () => {
    const stored = [
      {
        id: "stored-1",
        nome: "Stored Dentista",
        cro: "CRO-1",
        cpf: "111.222.333-44",
        email: "stored@test.com",
        especialidades: ["Ortodontia"],
        status: "Ativo",
      },
    ]
    storage["orthoplus_dentistas"] = JSON.stringify(stored)

    const { result } = renderHook(() => useDentistasStore())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.dentistas).toHaveLength(1)
    expect(result.current.dentistas[0].nome).toBe("Stored Dentista")
  })

  it("should add a new dentista", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newDentista = {
      nome: "Dra. Nova Teste",
      cro: "CRO-TESTE 99999",
      cpf: "999.888.777-66",
      email: "nova@teste.com",
      especialidades: ["Clínico Geral"],
      status: "Ativo",
    } as any

    act(() => {
      result.current.addDentista(newDentista)
    })

    expect(result.current.dentistas).toHaveLength(4)
    expect(result.current.dentistas[3].nome).toBe("Dra. Nova Teste")
    expect(result.current.dentistas[3].id).toBe("1700000000000")
    expect(result.current.dentistas[3].createdAt).toBeTruthy()
    expect(result.current.dentistas[3].updatedAt).toBeTruthy()
    expect(storage["orthoplus_dentistas"]).toContain("Dra. Nova Teste")
  })

  it("should update an existing dentista", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.updateDentista("1", { nome: "Dr. Carlos Silva Atualizado" })
    })

    const updated = result.current.dentistas.find((d) => d.id === "1")
    expect(updated?.nome).toBe("Dr. Carlos Silva Atualizado")
    expect(updated?.updatedAt).toBeTruthy()
    expect(storage["orthoplus_dentistas"]).toContain("Dr. Carlos Silva Atualizado")
  })

  it("should delete a dentista", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.deleteDentista("1")
    })

    expect(result.current.dentistas).toHaveLength(2)
    expect(result.current.dentistas.find((d) => d.id === "1")).toBeUndefined()
    expect(storage["orthoplus_dentistas"]).not.toContain("Dr. Carlos Silva")
  })

  it("should get a dentista by id", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const dentista = result.current.getDentista("2")
    expect(dentista?.nome).toBe("Dra. Ana Santos")
  })

  it("should return undefined for non-existent id", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const dentista = result.current.getDentista("non-existent")
    expect(dentista).toBeUndefined()
  })

  it("should filter dentistas by especialidade", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({ especialidade: "Ortodontia" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].nome).toBe("Dr. Carlos Silva")
  })

  it("should filter dentistas by search term (nome)", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({ search: "Ana" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].nome).toBe("Dra. Ana Santos")
  })

  it("should filter dentistas by search term (cro)", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({ search: "67890" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].nome).toBe("Dr. Pedro Costa")
  })

  it("should filter dentistas by search term (cpf)", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({ search: "987.654.321-00" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].nome).toBe("Dra. Ana Santos")
  })

  it("should filter dentistas by search term (email)", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({ search: "pedro.costa" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].nome).toBe("Dr. Pedro Costa")
  })

  it("should filter dentistas by status", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({ status: "Inativo" })
    expect(filtered).toHaveLength(0)
  })

  it("should return all dentistas when no filters are applied", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({})
    expect(filtered).toHaveLength(3)
  })

  it("should combine multiple filters", async () => {
    const { result } = renderHook(() => useDentistasStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterDentistas({
      search: "Dr",
      especialidade: "Clínico Geral",
      status: "Ativo",
    })
    expect(filtered).toHaveLength(2)
    expect(filtered.map((d) => d.nome)).toContain("Dr. Carlos Silva")
    expect(filtered.map((d) => d.nome)).toContain("Dra. Ana Santos")
  })
})
