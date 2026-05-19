import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

// Mutable auth state so individual tests can change clinicId / user
const authState: { clinicId: string | null; user: { id: string } | null } = {
  clinicId: "clinic-1",
  user: { id: "user-1" },
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

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

vi.stubGlobal("crypto", {
  randomUUID: () => "test-uuid-123",
})

import { useTransactions } from "../useTransactions"
import { Period } from "../../../domain/valueObjects/Period"

const createMockRow = (overrides: Record<string, unknown> = {}) => ({
  id: "t1",
  clinic_id: "clinic-1",
  type: "RECEITA",
  amount: 1500,
  currency: "BRL",
  description: "Consulta",
  category_id: "cat-1",
  due_date: "2024-01-15T00:00:00.000Z",
  paid_date: "2024-01-15T00:00:00.000Z",
  status: "PAGO",
  payment_method: "PIX",
  notes: "",
  created_by: "user-1",
  created_at: "2024-01-10T00:00:00.000Z",
  updated_at: "2024-01-15T00:00:00.000Z",
  ...overrides,
})

describe("useTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
    authState.clinicId = "clinic-1"
    authState.user = { id: "user-1" }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Loading state & data fetching
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and fetch transactions on mount", async () => {
    mockGet.mockResolvedValueOnce([createMockRow()])

    const { result } = renderHook(() => useTransactions())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.transactions[0].description).toBe("Consulta")
    expect(result.current.transactions[0].type).toBe("RECEITA")
    expect(mockGet).toHaveBeenCalledWith("/financeiro/transactions", expect.any(Object))
  })

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => useTransactions())

    // Hook never sets loading to false when clinicId is null (known behavior)
    expect(result.current.loading).toBe(true)
    expect(result.current.transactions).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  // ─────────────────────────────────────────────────────────────
  // Create / Pay transaction
  // ─────────────────────────────────────────────────────────────

  it("should create a transaction and reload list", async () => {
    mockGet.mockResolvedValueOnce([])
    mockPost.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([
      createMockRow({ id: "t-new", amount: 800, status: "PENDENTE", paid_date: undefined }),
    ])

    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createTransaction({
        type: "RECEITA",
        amount: 800,
        description: "Nova consulta",
        dueDate: new Date("2024-02-01"),
      })
    })

    expect(mockPost).toHaveBeenCalledWith(
      "/financeiro/transactions",
      expect.objectContaining({
        clinic_id: "clinic-1",
        type: "RECEITA",
        amount: 800,
        description: "Nova consulta",
        status: "PENDENTE",
        created_by: "user-1",
      }),
    )
    expect(mockGet).toHaveBeenCalledTimes(2)
    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.transactions[0].amount.toNumber()).toBe(800)
  })

  it("should throw error when creating transaction without user", async () => {
    authState.user = null

    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      result.current.createTransaction({
        type: "RECEITA",
        amount: 100,
        description: "Test",
        dueDate: new Date(),
      }),
    ).rejects.toThrow("Usuário não autenticado")
  })

  it("should pay a transaction and reload list", async () => {
    const txPending = createMockRow({
      id: "t1",
      status: "PENDENTE",
      paid_date: undefined,
    })

    mockGet.mockResolvedValueOnce([txPending])
    mockGet.mockResolvedValueOnce(txPending)
    mockPatch.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([
      createMockRow({ id: "t1", status: "PAGO", paid_date: "2024-01-20T00:00:00.000Z" }),
    ])

    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.payTransaction("t1", new Date("2024-01-20"), "PIX")
    })

    expect(mockPatch).toHaveBeenCalledWith("/financeiro/transactions/t1", expect.any(Object))
    expect(result.current.transactions[0].status).toBe("PAGO")
  })

  // ─────────────────────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────────────────────

  it("should apply filters by date range, category and type", async () => {
    const period = Period.custom(new Date("2024-01-01"), new Date("2024-01-31"))

    // Stable filters object to avoid hook re-renders
    const filters = {
      type: "DESPESA" as const,
      categoryId: "cat-2",
      period,
    }

    mockGet.mockImplementation((url: string, config?: { params?: Record<string, string> }) => {
      if (url === "/financeiro/transactions") {
        const params = config?.params || {}
        return Promise.resolve([
          createMockRow({
            id: "t-filtered",
            type: params.type || "RECEITA",
            category_id: params.category_id || "cat-1",
            amount: 300,
          }),
        ])
      }
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useTransactions(filters))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.transactions[0].type).toBe("DESPESA")
    expect(result.current.transactions[0].categoryId).toBe("cat-2")

    const lastCall = mockGet.mock.calls[mockGet.mock.calls.length - 1]
    const params = (lastCall[1] as { params: Record<string, string> })?.params
    expect(params?.type).toBe("DESPESA")
    expect(params?.category_id).toBe("cat-2")
    expect(params?.start_date).toBe(period.startDate.toISOString())
    expect(params?.end_date).toBe(period.endDate.toISOString())
  })

  // ─────────────────────────────────────────────────────────────
  // Analytics
  // ─────────────────────────────────────────────────────────────

  it("should calculate analytics correctly", async () => {
    mockGet.mockResolvedValueOnce([
      createMockRow({ id: "t1", type: "RECEITA", status: "PAGO", amount: 3000 }),
      createMockRow({ id: "t2", type: "RECEITA", status: "PENDENTE", amount: 1000, paid_date: undefined }),
      createMockRow({ id: "t3", type: "DESPESA", status: "PAGO", amount: 1500 }),
      createMockRow({ id: "t4", type: "DESPESA", status: "PENDENTE", amount: 500, paid_date: undefined }),
    ])

    const { result } = renderHook(() => useTransactions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.totalReceitas).toBe(3000)
    expect(result.current.totalDespesas).toBe(1500)
    expect(result.current.receitasPendentes).toBe(1000)
    expect(result.current.despesasPendentes).toBe(500)
    expect(result.current.saldo).toBe(1500)
  })
})
