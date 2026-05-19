import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

// Mutable auth state so individual tests can change user
const authState: { user: Record<string, any> | null } = { user: { id: "user-1" } }

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}))

function mockAllEndpoints(opts: {
  produtos?: any[]
  categorias?: any[]
  fornecedores?: any[]
  requisicoes?: any[]
  movimentacoes?: any[]
  alertas?: any[]
  pedidos?: any[]
  pedidosItens?: any[]
  pedidosConfig?: any[]
} = {}) {
  mockGet.mockImplementation((url: string) => {
    if (url === "/estoque/produtos") return Promise.resolve(opts.produtos ?? [])
    if (url === "/estoque/categorias") return Promise.resolve(opts.categorias ?? [])
    if (url === "/estoque/fornecedores") return Promise.resolve(opts.fornecedores ?? [])
    if (url === "/estoque/requisicoes") return Promise.resolve(opts.requisicoes ?? [])
    if (url === "/estoque/movimentacoes") return Promise.resolve(opts.movimentacoes ?? [])
    if (url === "/estoque/alertas") return Promise.resolve(opts.alertas ?? [])
    if (url === "/estoque/pedidos") return Promise.resolve(opts.pedidos ?? [])
    if (url === "/estoque/pedidos-itens") return Promise.resolve(opts.pedidosItens ?? [])
    if (url === "/estoque/pedidos-config") return Promise.resolve(opts.pedidosConfig ?? [])
    return Promise.resolve([])
  })
}

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

import { toast } from "sonner"
import { useEstoque } from "../useEstoque"

const mockProdutoApi = {
  id: "p1",
  codigo_barra: "7891234567890",
  nome: "Resina Composta",
  categoria: "Materiais",
  unidade_medida: "UNIDADE",
  quantidade_atual: "12",
  quantidade_minima: "5",
  valor_unitario: "150.00",
  fornecedor: "Dental Supply Ltda",
  localizacao: "A1-B2",
  lote: "LT2024001",
  data_validade: "2025-12-31",
  ativo: true,
  clinic_id: "clinic-1",
  created_at: "2024-01-01T00:00:00",
}

const mockCategoriaApi = {
  id: "c1",
  nome: "Materiais de Restauração",
  descricao: "Resinas e cimentos",
}

const mockFornecedorApi = {
  id: "f1",
  nome: "Dental Supply Ltda",
  cnpj: "12.345.678/0001-90",
  telefone: "(11) 3456-7890",
  email: "contato@dentalsupply.com.br",
  contato: "João",
  prazo_entrega_dias: 7,
}

const mockRequisicaoApi = {
  id: "r1",
  produto_id: "p1",
  quantidade: "5",
  motivo: "Urgente",
  prioridade: "ALTA",
  status: "PENDENTE",
  solicitado_por: "user-1",
  aprovado_por: null,
  data_aprovacao: null,
  observacoes: null,
  created_at: "2024-01-01T00:00:00",
}

const mockMovimentacaoApi = {
  id: "m1",
  produto_id: "p1",
  tipo: "ENTRADA",
  quantidade: "10",
  lote: "LT2024001",
  data_validade: "2025-12-31",
  motivo: "Compra",
  valor_unitario: "95.00",
  valor_total: "950.00",
  fornecedor_id: "f1",
  nota_fiscal: "NF123",
  realizado_por: "user-1",
  observacoes: null,
  created_at: "2024-01-01T00:00:00",
}

const mockAlertaApi = {
  id: "a1",
  produto_id: "p1",
  tipo: "ESTOQUE_BAIXO",
  mensagem: "Estoque baixo para Resina Composta",
  quantidade_atual: "3",
  quantidade_sugerida: "10",
  lido: false,
  created_at: "2024-01-01T00:00:00",
}

const mockPedidoApi = {
  id: "pd1",
  numero_pedido: "PED-001",
  fornecedor_id: "f1",
  status: "ENVIADO",
  tipo: "COMPRA",
  data_pedido: "2024-01-01",
  data_prevista_entrega: "2024-01-10",
  data_recebimento: null,
  valor_total: "500.00",
  observacoes: null,
  gerado_automaticamente: false,
  created_at: "2024-01-01T00:00:00",
  created_by: "user-1",
}

const mockPedidoItemApi = {
  id: "pi1",
  pedido_id: "pd1",
  produto_id: "p1",
  quantidade: "10",
  preco_unitario: "50.00",
  valor_total: "500.00",
  quantidade_recebida: "0",
  observacoes: null,
  created_at: "2024-01-01T00:00:00",
}

const mockPedidoConfigApi = {
  id: "pc1",
  produto_id: "p1",
  quantidade_reposicao: "20",
  ponto_pedido: "10",
  gerar_automaticamente: true,
  dias_entrega_estimados: 7,
  created_at: "2024-01-01T00:00:00",
}

describe("useEstoque", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
    authState.user = { id: "user-1" }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // loadData / loading state
  // ─────────────────────────────────────────────────────────────

  it("should set loading to true and then false after loadData", async () => {
    mockAllEndpoints({
      produtos: [mockProdutoApi],
      categorias: [mockCategoriaApi],
      fornecedores: [mockFornecedorApi],
      requisicoes: [mockRequisicaoApi],
      movimentacoes: [mockMovimentacaoApi],
      alertas: [mockAlertaApi],
      pedidos: [mockPedidoApi],
      pedidosItens: [mockPedidoItemApi],
      pedidosConfig: [mockPedidoConfigApi],
    })

    const { result } = renderHook(() => useEstoque())

    // Initial state: loading should be false until loadData is called
    expect(result.current.loading).toBe(false)

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.produtos).toHaveLength(1)
    expect(result.current.produtos[0].nome).toBe("Resina Composta")
  })

  it("should not load data when user is null", async () => {
    authState.user = null

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(mockGet).not.toHaveBeenCalled()
    expect(result.current.produtos).toHaveLength(0)
  })

  it("should set loading to false even when individual loaders fail", async () => {
    // Individual loaders swallow their own errors, so loadData's catch is not reached.
    mockGet.mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    // loadData does not show toast because each inner loader catches its own error
    expect(toast.error).not.toHaveBeenCalledWith("Erro ao carregar dados do estoque")
    expect(result.current.loading).toBe(false)
  })

  // ─────────────────────────────────────────────────────────────
  // Produtos CRUD
  // ─────────────────────────────────────────────────────────────

  it("should load produtos and map fields correctly", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.produtos).toHaveLength(1)
    expect(result.current.produtos[0].id).toBe("p1")
    expect(result.current.produtos[0].codigo_barra).toBe("7891234567890")
    expect(result.current.produtos[0].quantidadeAtual).toBe(12)
    expect(result.current.produtos[0].quantidadeMinima).toBe(5)
    expect(result.current.produtos[0].valorUnitario).toBe(150)
    expect(result.current.produtos[0].unidadeMedida).toBe("UNIDADE")
  })

  it("should add a produto and reload data", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi] })
    mockPost.mockResolvedValueOnce({ id: "p2", ...mockProdutoApi })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    const newProduto = {
      codigo_barra: "0000000000000",
      nome: "Novo Produto",
      categoria: "Teste",
      unidadeMedida: "CAIXA",
      quantidadeAtual: 20,
      quantidadeMinima: 5,
      valorUnitario: 100,
      fornecedor: "Fornecedor Teste",
      localizacao: "B1",
      ativo: true,
    }

    await act(async () => {
      await result.current.addProduto(newProduto)
    })

    expect(mockPost).toHaveBeenCalledWith("/estoque/produtos", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Produto adicionado com sucesso")
  })

  it("should show toast.error on addProduto failure", async () => {
    mockAllEndpoints()
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(
        result.current.addProduto({
          codigo_barra: "",
          nome: "Test",
          categoria: "",
          unidadeMedida: "UNIDADE",
          quantidadeAtual: 0,
          quantidadeMinima: 0,
          valorUnitario: 0,
          fornecedor: "",
          localizacao: "",
          ativo: true,
        })
      ).rejects.toThrow("Save failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao adicionar produto")
  })

  it("should update a produto and reload data", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi], alertas: [] })
    mockPatch.mockResolvedValueOnce({ ...mockProdutoApi, nome: "Resina Atualizada" })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.updateProduto("p1", { nome: "Resina Atualizada" })
    })

    expect(mockPatch).toHaveBeenCalledWith("/estoque/produtos/p1", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Produto atualizado com sucesso")
  })

  it("should show toast.error on updateProduto failure", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi] })
    mockPatch.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(
        result.current.updateProduto("p1", { nome: "Test" })
      ).rejects.toThrow("Update failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar produto")
  })

  it("should delete a produto and reload data", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi] })
    mockDelete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.deleteProduto("p1")
    })

    expect(mockDelete).toHaveBeenCalledWith("/estoque/produtos/p1")
    expect(toast.success).toHaveBeenCalledWith("Produto excluído com sucesso")
  })

  it("should show toast.error on deleteProduto failure", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi] })
    mockDelete.mockRejectedValueOnce(new Error("Delete failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(result.current.deleteProduto("p1")).rejects.toThrow("Delete failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao excluir produto")
  })

  it("should get produto by id", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.getProdutoById("p1")?.nome).toBe("Resina Composta")
    expect(result.current.getProdutoById("nonexistent")).toBeUndefined()
  })

  // ─────────────────────────────────────────────────────────────
  // Categorias
  // ─────────────────────────────────────────────────────────────

  it("should load categorias", async () => {
    mockAllEndpoints({ categorias: [mockCategoriaApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.categorias).toHaveLength(1)
    expect(result.current.categorias[0].nome).toBe("Materiais de Restauração")
  })

  it("should add a categoria", async () => {
    mockAllEndpoints()
    mockPost.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.addCategoria({ nome: "Nova Categoria", descricao: "Desc" })
    })

    expect(mockPost).toHaveBeenCalledWith("/estoque/categorias", { nome: "Nova Categoria", descricao: "Desc" })
    expect(toast.success).toHaveBeenCalledWith("Categoria adicionada")
  })

  it("should show toast.error on addCategoria failure", async () => {
    mockAllEndpoints()
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(
        result.current.addCategoria({ nome: "Test", descricao: "" })
      ).rejects.toThrow("Save failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao adicionar categoria")
  })

  it("should update a categoria", async () => {
    mockAllEndpoints()
    mockPatch.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.updateCategoria("c1", { nome: "Cat Atualizada" })
    })

    expect(mockPatch).toHaveBeenCalledWith("/estoque/categorias/c1", { nome: "Cat Atualizada" })
    expect(toast.success).toHaveBeenCalledWith("Categoria atualizada")
  })

  it("should delete a categoria", async () => {
    mockAllEndpoints()
    mockDelete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.deleteCategoria("c1")
    })

    expect(mockDelete).toHaveBeenCalledWith("/estoque/categorias/c1")
    expect(toast.success).toHaveBeenCalledWith("Categoria removida")
  })

  it("should get categoria by id", async () => {
    mockAllEndpoints({ categorias: [mockCategoriaApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.getCategoriaById("c1")?.nome).toBe("Materiais de Restauração")
    expect(result.current.getCategoriaById("nonexistent")).toBeUndefined()
  })

  // ─────────────────────────────────────────────────────────────
  // Fornecedores
  // ─────────────────────────────────────────────────────────────

  it("should load fornecedores", async () => {
    mockAllEndpoints({ fornecedores: [mockFornecedorApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.fornecedores).toHaveLength(1)
    expect(result.current.fornecedores[0].nome).toBe("Dental Supply Ltda")
    expect(result.current.fornecedores[0].prazo_entrega_dias).toBe(7)
  })

  it("should add a fornecedor", async () => {
    mockAllEndpoints()
    mockPost.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.addFornecedor({
        nome: "Novo Fornecedor",
        cnpj: "11.111.111/0001-11",
      })
    })

    expect(mockPost).toHaveBeenCalledWith("/estoque/fornecedores", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Fornecedor adicionado")
  })

  it("should update a fornecedor", async () => {
    mockAllEndpoints()
    mockPatch.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.updateFornecedor("f1", { nome: "Forn Atualizado" })
    })

    expect(mockPatch).toHaveBeenCalledWith("/estoque/fornecedores/f1", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Fornecedor atualizado")
  })

  it("should delete a fornecedor", async () => {
    mockAllEndpoints()
    mockDelete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.deleteFornecedor("f1")
    })

    expect(mockDelete).toHaveBeenCalledWith("/estoque/fornecedores/f1")
    expect(toast.success).toHaveBeenCalledWith("Fornecedor removido")
  })

  it("should get fornecedor by id", async () => {
    mockAllEndpoints({ fornecedores: [mockFornecedorApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.getFornecedorById("f1")?.nome).toBe("Dental Supply Ltda")
    expect(result.current.getFornecedorById("nonexistent")).toBeUndefined()
  })

  // ─────────────────────────────────────────────────────────────
  // Requisições
  // ─────────────────────────────────────────────────────────────

  it("should load requisicoes", async () => {
    mockAllEndpoints({ requisicoes: [mockRequisicaoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.requisicoes).toHaveLength(1)
    expect(result.current.requisicoes[0].produtoId).toBe("p1")
    expect(result.current.requisicoes[0].quantidade).toBe(5)
    expect(result.current.requisicoes[0].status).toBe("PENDENTE")
  })

  it("should add a requisicao", async () => {
    mockAllEndpoints()
    mockPost.mockResolvedValueOnce({ id: "r2" })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    const requisicao = {
      id: "r2",
      produtoId: "p1",
      quantidade: 3,
      motivo: "Necessidade",
      prioridade: "NORMAL" as const,
      status: "PENDENTE" as const,
      solicitadoPor: "user-1",
    }

    await act(async () => {
      await result.current.addRequisicao(requisicao)
    })

    expect(mockPost).toHaveBeenCalledWith("/estoque/requisicoes", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Requisição criada com sucesso")
  })

  it("should show toast.error on addRequisicao failure", async () => {
    mockAllEndpoints()
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(
        result.current.addRequisicao({
          id: "r1",
          produtoId: "p1",
          quantidade: 1,
          motivo: "Test",
          prioridade: "BAIXA",
          status: "PENDENTE",
          solicitadoPor: "user-1",
        })
      ).rejects.toThrow("Save failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar requisição")
  })

  it("should aprovar a requisicao and create movimentacao", async () => {
    mockAllEndpoints({
      requisicoes: [mockRequisicaoApi],
      produtos: [mockProdutoApi],
      movimentacoes: [],
      alertas: [],
    })
    mockPatch.mockResolvedValueOnce({})
    mockPost.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.aprovarRequisicao("r1", "admin-1")
    })

    expect(mockPatch).toHaveBeenCalledWith("/estoque/requisicoes/r1", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Requisição aprovada com sucesso")
  })

  it("should rejeitar a requisicao", async () => {
    mockAllEndpoints({ requisicoes: [mockRequisicaoApi] })
    mockPatch.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.rejeitarRequisicao("r1", "Sem justificativa")
    })

    expect(toast.success).toHaveBeenCalledWith("Requisição rejeitada")
  })

  it("should get requisicao by id", async () => {
    mockAllEndpoints({ requisicoes: [mockRequisicaoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.getRequisicaoById("r1")?.motivo).toBe("Urgente")
    expect(result.current.getRequisicaoById("nonexistent")).toBeUndefined()
  })

  // ─────────────────────────────────────────────────────────────
  // Movimentações
  // ─────────────────────────────────────────────────────────────

  it("should load movimentacoes", async () => {
    mockAllEndpoints({ movimentacoes: [mockMovimentacaoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.movimentacoes).toHaveLength(1)
    expect(result.current.movimentacoes[0].tipo).toBe("ENTRADA")
    expect(result.current.movimentacoes[0].quantidade).toBe(10)
  })

  it("should add a movimentacao", async () => {
    mockAllEndpoints({ movimentacoes: [], produtos: [mockProdutoApi], alertas: [] })
    mockPost.mockResolvedValueOnce({ id: "m2" })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.addMovimentacao({
        produtoId: "p1",
        tipo: "ENTRADA",
        quantidade: 5,
        motivo: "Compra",
        realizadoPor: "user-1",
      })
    })

    expect(mockPost).toHaveBeenCalledWith("/estoque/movimentacoes", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Movimentação registrada com sucesso")
  })

  it("should show toast.error on addMovimentacao failure", async () => {
    mockAllEndpoints()
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(
        result.current.addMovimentacao({
          produtoId: "p1",
          tipo: "SAIDA",
          quantidade: 1,
          motivo: "Test",
          realizadoPor: "user-1",
        })
      ).rejects.toThrow("Save failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar movimentação")
  })

  it("should get movimentacao by id", async () => {
    mockAllEndpoints({ movimentacoes: [mockMovimentacaoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.getMovimentacaoById("m1")?.tipo).toBe("ENTRADA")
    expect(result.current.getMovimentacaoById("nonexistent")).toBeUndefined()
  })

  // ─────────────────────────────────────────────────────────────
  // Alertas
  // ─────────────────────────────────────────────────────────────

  it("should load alertas", async () => {
    mockAllEndpoints({ alertas: [mockAlertaApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.alertas).toHaveLength(1)
    expect(result.current.alertas[0].tipo).toBe("ESTOQUE_BAIXO")
    expect(result.current.alertas[0].quantidadeAtual).toBe(3)
  })

  it("should marcar alerta como lido", async () => {
    mockAllEndpoints({ alertas: [mockAlertaApi] })
    mockPatch.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.marcarAlertaComoLido("a1")
    })

    expect(mockPatch).toHaveBeenCalledWith("/estoque/alertas/a1", { lido: true })
  })

  it("should show toast.error on marcarAlertaComoLido failure", async () => {
    mockAllEndpoints({ alertas: [mockAlertaApi] })
    mockPatch.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(result.current.marcarAlertaComoLido("a1")).rejects.toThrow("Update failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao marcar alerta como lido")
  })

  it("should limpar alertas lidos", async () => {
    mockAllEndpoints({ alertas: [mockAlertaApi] })
    mockDelete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.limparAlertasLidos()
    })

    expect(mockDelete).toHaveBeenCalledWith("/estoque/alertas/lidos")
    expect(toast.success).toHaveBeenCalledWith("Alertas lidos removidos")
  })

  it("should show toast.error on limparAlertasLidos failure", async () => {
    mockAllEndpoints({ alertas: [mockAlertaApi] })
    mockDelete.mockRejectedValueOnce(new Error("Delete failed"))

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await expect(result.current.limparAlertasLidos()).rejects.toThrow("Delete failed")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao limpar alertas")
  })

  // ─────────────────────────────────────────────────────────────
  // calcularSugestaoReposicao
  // ─────────────────────────────────────────────────────────────

  it("should return 0 for calcularSugestaoReposicao when stock is sufficient", async () => {
    mockAllEndpoints({ produtos: [mockProdutoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    const sugestao = result.current.calcularSugestaoReposicao("p1")
    expect(sugestao).toBe(0)
  })

  it("should suggest reposicao when stock is low", async () => {
    mockAllEndpoints({
      produtos: [{ ...mockProdutoApi, quantidade_atual: "2" }],
      movimentacoes: [
        {
          ...mockMovimentacaoApi,
          tipo: "SAIDA",
          quantidade: "60",
          created_at: new Date().toISOString(),
        },
      ],
    })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    const sugestao = result.current.calcularSugestaoReposicao("p1")
    // 60 units consumed in 30 days = 2/day, current stock = 2, diasEstoque = 1 < 15
    // Should suggest ceil(2 * 60) = 120
    expect(sugestao).toBe(120)
  })

  // ─────────────────────────────────────────────────────────────
  // Pedidos
  // ─────────────────────────────────────────────────────────────

  it("should load pedidos", async () => {
    mockAllEndpoints({ pedidos: [mockPedidoApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.pedidos).toHaveLength(1)
    expect(result.current.pedidos[0].numeroPedido).toBe("PED-001")
    expect(result.current.pedidos[0].status).toBe("ENVIADO")
  })

  it("should load pedidos itens", async () => {
    mockAllEndpoints({ pedidosItens: [mockPedidoItemApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.pedidosItens).toHaveLength(1)
    expect(result.current.pedidosItens[0].quantidade).toBe(10)
    expect(result.current.pedidosItens[0].quantidadeRecebida).toBe(0)
  })

  it("should load pedidos config", async () => {
    mockAllEndpoints({ pedidosConfig: [mockPedidoConfigApi] })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.pedidosConfig).toHaveLength(1)
    expect(result.current.pedidosConfig[0].quantidadeReposicao).toBe(20)
    expect(result.current.pedidosConfig[0].gerarAutomaticamente).toBe(true)
  })

  it("should add pedido config", async () => {
    mockAllEndpoints()
    mockPost.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.addPedidoConfig({
        produtoId: "p1",
        quantidadeReposicao: 15,
        pontoPedido: 8,
        gerarAutomaticamente: false,
        diasEntregaEstimados: 5,
      })
    })

    expect(mockPost).toHaveBeenCalledWith("/estoque/pedidos-config", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Configuração criada com sucesso")
  })

  it("should update pedido config", async () => {
    mockAllEndpoints()
    mockPatch.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.updatePedidoConfig("pc1", {
        produtoId: "p1",
        quantidadeReposicao: 25,
        pontoPedido: 12,
        gerarAutomaticamente: true,
        diasEntregaEstimados: 10,
      })
    })

    expect(mockPatch).toHaveBeenCalledWith("/estoque/pedidos-config/pc1", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Configuração atualizada com sucesso")
  })

  it("should update pedido status", async () => {
    mockAllEndpoints()
    mockPatch.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.updatePedidoStatus("pd1", "RECEBIDO")
    })

    expect(mockPatch).toHaveBeenCalledWith(
      "/estoque/pedidos/pd1",
      expect.objectContaining({ status: "RECEBIDO", data_recebimento: expect.any(String) })
    )
    expect(toast.success).toHaveBeenCalledWith("Status do pedido atualizado")
  })

  it("should gerar pedidos automaticos", async () => {
    mockAllEndpoints()
    mockPost.mockResolvedValueOnce({})

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    await act(async () => {
      await result.current.gerarPedidosAutomaticos()
    })

    expect(mockPost).toHaveBeenCalledWith("/estoque/pedidos/gerar-automaticos", {})
    expect(toast.success).toHaveBeenCalledWith("Pedidos automáticos gerados com sucesso")
  })

  // ─────────────────────────────────────────────────────────────
  // reloadData
  // ─────────────────────────────────────────────────────────────

  it("should reload data when reloadData is called", async () => {
    mockAllEndpoints({
      produtos: [mockProdutoApi],
      categorias: [mockCategoriaApi],
      fornecedores: [mockFornecedorApi],
      requisicoes: [mockRequisicaoApi],
      movimentacoes: [mockMovimentacaoApi],
      alertas: [mockAlertaApi],
      pedidos: [mockPedidoApi],
      pedidosItens: [mockPedidoItemApi],
      pedidosConfig: [mockPedidoConfigApi],
    })

    const { result } = renderHook(() => useEstoque())

    await act(async () => {
      await result.current.loadData()
    })

    expect(result.current.produtos).toHaveLength(1)

    // Change mock to return more items on second call
    mockAllEndpoints({
      produtos: [mockProdutoApi, { ...mockProdutoApi, id: "p2" }],
      categorias: [mockCategoriaApi],
      fornecedores: [mockFornecedorApi],
      requisicoes: [mockRequisicaoApi],
      movimentacoes: [mockMovimentacaoApi],
      alertas: [mockAlertaApi],
      pedidos: [mockPedidoApi],
      pedidosItens: [mockPedidoItemApi],
      pedidosConfig: [mockPedidoConfigApi],
    })

    await act(async () => {
      await result.current.reloadData()
    })

    expect(result.current.produtos).toHaveLength(2)
  })
})
