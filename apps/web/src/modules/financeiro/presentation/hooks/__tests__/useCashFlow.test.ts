import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"

// Mutable auth state so individual tests can change clinicId
const authState: { clinicId: string | null } = { clinicId: "clinic-1" }

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

import { useCashFlow } from "../useCashFlow"
import { Period } from "../../../domain/valueObjects/Period"

const createMockTxRow = (overrides: Record<string, unknown> = {}) => ({
  id: "t1",
  clinic_id: "clinic-1",
  type: "RECEITA",
  amount: 1000,
  currency: "BRL",
  description: "Test",
  due_date: "2024-01-15T00:00:00.000Z",
  status: "PENDENTE",
  created_by: "user-1",
  created_at: "2024-01-10T00:00:00.000Z",
  updated_at: "2024-01-10T00:00:00.000Z",
  ...overrides,
})

describe("useCashFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
    authState.clinicId = "clinic-1"
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─────────────────────────────────────────────────────────────
  // Cash flow calculation
  // ─────────────────────────────────────────────────────────────

  it("should show loading state and calculate cash flow on mount", async () => {
    mockGet.mockImplementation((url: string, config?: { params?: Record<string, string> }) => {
      if (url !== "/financeiro/transactions") return Promise.resolve([])

      const params = config?.params || {}
      if (params.type === "RECEITA" && params.status === "PAGO") {
        return Promise.resolve([{ amount: 5000 }, { amount: 2000 }])
      }
      if (params.type === "DESPESA" && params.status === "PAGO") {
        return Promise.resolve([{ amount: 1500 }])
      }
      if (params.status === "PENDENTE") {
        return Promise.resolve([
          createMockTxRow({ type: "RECEITA", amount: 800 }),
          createMockTxRow({ type: "DESPESA", amount: 300 }),
        ])
      }
      return Promise.resolve([])
    })

    const period = Period.custom(new Date("2024-01-01"), new Date("2024-01-31"))
    const { result } = renderHook(() => useCashFlow(period))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.cashFlow).not.toBeNull()
    expect(result.current.cashFlow?.totalReceitas).toBe(7000)
    expect(result.current.cashFlow?.totalDespesas).toBe(1500)
    expect(result.current.cashFlow?.saldo).toBe(5500)
    expect(result.current.cashFlow?.receitasPendentes).toBe(800)
    expect(result.current.cashFlow?.despesasPendentes).toBe(300)
  })

  it("should not fetch when clinicId is null", async () => {
    authState.clinicId = null

    const period = Period.custom(new Date("2024-01-01"), new Date("2024-01-31"))
    const { result } = renderHook(() => useCashFlow(period))

    // Hook never sets loading to false when clinicId is null (known behavior)
    expect(result.current.loading).toBe(true)
    expect(result.current.cashFlow).toBeNull()
    expect(mockGet).not.toHaveBeenCalled()
  })

  // ─────────────────────────────────────────────────────────────
  // Period filtering
  // ─────────────────────────────────────────────────────────────

  it("should use custom period when provided", async () => {
    const customPeriod = Period.custom(new Date("2024-03-01"), new Date("2024-03-31"))

    mockGet.mockImplementation((url: string, config?: { params?: Record<string, string> }) => {
      if (url !== "/financeiro/transactions") return Promise.resolve([])

      const params = config?.params || {}
      if (params.type === "RECEITA" && params.status === "PAGO") {
        return Promise.resolve([{ amount: 10000 }])
      }
      if (params.type === "DESPESA" && params.status === "PAGO") {
        return Promise.resolve([{ amount: 4000 }])
      }
      if (params.status === "PENDENTE") {
        return Promise.resolve([])
      }
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useCashFlow(customPeriod))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.cashFlow?.totalReceitas).toBe(10000)
    expect(result.current.cashFlow?.totalDespesas).toBe(4000)
    expect(result.current.cashFlow?.saldo).toBe(6000)

    // Verify period was passed in params
    const calls = mockGet.mock.calls.filter((call) => call[0] === "/financeiro/transactions")
    const receitaCall = calls.find((call) => {
      const params = (call[1] as { params?: Record<string, string> })?.params
      return params?.type === "RECEITA"
    })
    const params = (receitaCall?.[1] as { params: Record<string, string> })?.params
    expect(params?.start_date).toBe(customPeriod.startDate.toISOString())
    expect(params?.end_date).toBe(customPeriod.endDate.toISOString())
  })

  it("should refetch when period changes", async () => {
    const period1 = Period.custom(new Date("2024-01-01"), new Date("2024-01-31"))
    const period2 = Period.custom(new Date("2024-02-01"), new Date("2024-02-29"))

    mockGet.mockImplementation((url: string, config?: { params?: Record<string, string> }) => {
      if (url !== "/financeiro/transactions") return Promise.resolve([])

      const params = config?.params || {}
      if (params.type === "RECEITA" && params.status === "PAGO") {
        if (params.start_date?.startsWith("2024-01")) {
          return Promise.resolve([{ amount: 3000 }])
        }
        if (params.start_date?.startsWith("2024-02")) {
          return Promise.resolve([{ amount: 5000 }])
        }
      }
      if (params.type === "DESPESA" && params.status === "PAGO") {
        return Promise.resolve([{ amount: 1000 }])
      }
      if (params.status === "PENDENTE") {
        return Promise.resolve([])
      }
      return Promise.resolve([])
    })

    const { result, rerender } = renderHook(({ period }) => useCashFlow(period), {
      initialProps: { period: period1 },
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.cashFlow?.totalReceitas).toBe(3000)

    rerender({ period: period2 })

    await waitFor(() => expect(result.current.cashFlow?.totalReceitas).toBe(5000))
    expect(result.current.cashFlow?.saldo).toBe(4000)
  })
})
