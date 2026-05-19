import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
})

import { toast } from "sonner"
import { useFuncionariosStore } from "../useFuncionariosStore"

describe("useFuncionariosStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ─────────────────────────────────────────────────────────────
  // Initial state
  // ─────────────────────────────────────────────────────────────

  it("should initialize with mock data when localStorage is empty", async () => {
    const { result } = renderHook(() => useFuncionariosStore())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.funcionarios).toHaveLength(3)
    expect(result.current.funcionarios[0].nome).toBe("Roberto Silva Santos")
    expect(result.current.funcionarios[1].nome).toBe("Juliana Oliveira Costa")
    expect(result.current.funcionarios[2].nome).toBe("Marcos Paulo Ferreira")
  })

  it("should load from localStorage when data exists", async () => {
    const customData = [
      {
        id: "99",
        nome: "Custom Funcionario",
        cpf: "000.000.000-00",
        dataNascimento: "1990-01-01",
        sexo: "M",
        telefone: "(11) 1111-1111",
        celular: "(11) 91111-1111",
        email: "custom@test.com",
        endereco: {
          cep: "00000-000",
          logradouro: "Rua",
          numero: "1",
          bairro: "Bairro",
          cidade: "Cidade",
          estado: "SP",
        },
        cargo: "Gerente",
        dataAdmissao: "2020-01-01",
        salario: 3000,
        permissoes: {},
        horarioTrabalho: { inicio: "08:00", fim: "17:00" },
        diasTrabalho: [1],
        status: "Ativo",
        createdAt: "2020-01-01T00:00:00",
        updatedAt: "2020-01-01T00:00:00",
      },
    ]
    localStorage.setItem("orthoplus_funcionarios", JSON.stringify(customData))

    const { result } = renderHook(() => useFuncionariosStore())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.funcionarios).toHaveLength(1)
    expect(result.current.funcionarios[0].nome).toBe("Custom Funcionario")
  })

  // ─────────────────────────────────────────────────────────────
  // addFuncionario
  // ─────────────────────────────────────────────────────────────

  it("should add a funcionario", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newFuncionario = {
      id: "",
      nome: "Novo Funcionario",
      cpf: "444.555.666-77",
      dataNascimento: "1990-01-01",
      sexo: "F" as const,
      telefone: "(11) 1234-5678",
      celular: "(11) 91234-5678",
      email: "novo@test.com",
      endereco: {
        cep: "00000-000",
        logradouro: "Rua",
        numero: "1",
        bairro: "Bairro",
        cidade: "Cidade",
        estado: "SP",
      },
      cargo: "Secretário(a)" as const,
      dataAdmissao: "2023-01-01",
      salario: 2500,
      permissoes: {},
      horarioTrabalho: { inicio: "08:00", fim: "17:00" },
      diasTrabalho: [1, 2, 3, 4, 5],
      status: "Ativo" as const,
    }

    act(() => {
      result.current.addFuncionario(newFuncionario as any)
    })

    expect(result.current.funcionarios).toHaveLength(4)
    expect(result.current.funcionarios[3].nome).toBe("Novo Funcionario")
    expect(result.current.funcionarios[3].id).toBeDefined()
    expect(toast.success).toHaveBeenCalledWith("Funcionário cadastrado com sucesso")
  })

  // ─────────────────────────────────────────────────────────────
  // updateFuncionario
  // ─────────────────────────────────────────────────────────────

  it("should update a funcionario", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.updateFuncionario("1", { nome: "Roberto Atualizado" })
    })

    const updated = result.current.funcionarios.find((f) => f.id === "1")
    expect(updated?.nome).toBe("Roberto Atualizado")
    expect(toast.success).toHaveBeenCalledWith("Funcionário atualizado com sucesso")
  })

  // ─────────────────────────────────────────────────────────────
  // deleteFuncionario
  // ─────────────────────────────────────────────────────────────

  it("should delete a funcionario", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.deleteFuncionario("1")
    })

    expect(result.current.funcionarios).toHaveLength(2)
    expect(result.current.funcionarios.find((f) => f.id === "1")).toBeUndefined()
    expect(toast.success).toHaveBeenCalledWith("Funcionário removido com sucesso")
  })

  // ─────────────────────────────────────────────────────────────
  // getFuncionario
  // ─────────────────────────────────────────────────────────────

  it("should get a funcionario by id", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const funcionario = result.current.getFuncionario("1")
    expect(funcionario?.nome).toBe("Roberto Silva Santos")

    const notFound = result.current.getFuncionario("999")
    expect(notFound).toBeUndefined()
  })

  // ─────────────────────────────────────────────────────────────
  // filterFuncionarios
  // ─────────────────────────────────────────────────────────────

  it("should filter funcionarios by search term (nome)", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const filtered = result.current.filterFuncionarios({ search: "Juliana" })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].nome).toBe("Juliana Oliveira Costa")
  })

  it("should filter funcionarios by search term (CPF)", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const byCpf = result.current.filterFuncionarios({ search: "333.444.555-66" })
    expect(byCpf).toHaveLength(1)
    expect(byCpf[0].nome).toBe("Marcos Paulo Ferreira")
  })

  it("should filter funcionarios by search term (email)", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const byEmail = result.current.filterFuncionarios({
      search: "juliana.oliveira@clinica.com",
    })
    expect(byEmail).toHaveLength(1)
    expect(byEmail[0].nome).toBe("Juliana Oliveira Costa")
  })

  it("should return empty array when search has no matches", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const noMatch = result.current.filterFuncionarios({ search: "zzz" })
    expect(noMatch).toHaveLength(0)
  })

  it("should filter funcionarios by status", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // All mock data start as "Ativo", update one to "Inativo"
    act(() => {
      result.current.updateFuncionario("2", { status: "Inativo" as any })
    })

    const ativos = result.current.filterFuncionarios({ status: "Ativo" })
    expect(ativos).toHaveLength(2)

    const inativos = result.current.filterFuncionarios({ status: "Inativo" })
    expect(inativos).toHaveLength(1)
    expect(inativos[0].id).toBe("2")
  })

  it("should filter funcionarios by cargo", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const admins = result.current.filterFuncionarios({ cargo: "Administrador" })
    expect(admins).toHaveLength(1)

    const recepcionistas = result.current.filterFuncionarios({
      cargo: "Recepcionista",
    })
    expect(recepcionistas).toHaveLength(1)

    const noMatch = result.current.filterFuncionarios({ cargo: "Gerente" })
    expect(noMatch).toHaveLength(0)
  })

  it("should combine multiple filters", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const combined = result.current.filterFuncionarios({
      search: "Roberto",
      status: "Ativo",
      cargo: "Administrador",
    })
    expect(combined).toHaveLength(1)
    expect(combined[0].nome).toBe("Roberto Silva Santos")
  })

  // ─────────────────────────────────────────────────────────────
  // verificarPermissao
  // ─────────────────────────────────────────────────────────────

  it("should return true when funcionario has the requested permission", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const hasPermission = result.current.verificarPermissao("1", "pacientes", "visualizar")
    expect(hasPermission).toBe(true)

    const hasEdit = result.current.verificarPermissao("1", "pacientes", "editar")
    expect(hasEdit).toBe(true)
  })

  it("should return false when funcionario does not have the requested permission", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const noPermission = result.current.verificarPermissao("1", "configuracoes", "excluir")
    expect(noPermission).toBe(false)
  })

  it("should return false for non-existent funcionario", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const nonExistent = result.current.verificarPermissao("999", "pacientes", "visualizar")
    expect(nonExistent).toBe(false)
  })

  it("should return false for non-existent modulo", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const noModulo = result.current.verificarPermissao("1", "inexistente", "visualizar")
    expect(noModulo).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────

  it("should persist changes to localStorage", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.deleteFuncionario("1")
    })

    const stored = JSON.parse(localStorage.getItem("orthoplus_funcionarios") || "[]")
    expect(stored).toHaveLength(2)
    expect(stored.find((f: any) => f.id === "1")).toBeUndefined()
  })

  it("should persist added funcionario to localStorage", async () => {
    const { result } = renderHook(() => useFuncionariosStore())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.addFuncionario({
        id: "",
        nome: "Teste LocalStorage",
        cpf: "000.000.000-00",
        dataNascimento: "1990-01-01",
        sexo: "M",
        telefone: "(11) 1111-1111",
        celular: "(11) 91111-1111",
        email: "test@local.com",
        endereco: {
          cep: "00000-000",
          logradouro: "Rua",
          numero: "1",
          bairro: "Bairro",
          cidade: "Cidade",
          estado: "SP",
        },
        cargo: "Gerente",
        dataAdmissao: "2020-01-01",
        salario: 3000,
        permissoes: {},
        horarioTrabalho: { inicio: "08:00", fim: "17:00" },
        diasTrabalho: [1],
        status: "Ativo",
      } as any)
    })

    const stored = JSON.parse(localStorage.getItem("orthoplus_funcionarios") || "[]")
    expect(stored).toHaveLength(4)
    expect(stored.some((f: any) => f.nome === "Teste LocalStorage")).toBe(true)
  })
})
