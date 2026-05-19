import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

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

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  }),
}))

vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/lib/utils/crypto-cache.utils", () => ({
  fetchExchangeRateWithCache: vi.fn(),
}))

import { useCrypto } from "../useCrypto"
import { fetchExchangeRateWithCache } from "@/lib/utils/crypto-cache.utils"

const mockExchange = {
  id: "ex1",
  clinic_id: "clinic-1",
  exchange_name: "BINANCE",
  api_key_encrypted: "enc",
  is_active: true,
  wallet_address: "0xabc",
  supported_coins: ["BTC", "ETH"],
  auto_convert_to_brl: false,
  conversion_threshold: 0,
  processing_fee_percentage: 1.5,
  created_by: "u1",
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
}

const mockWallet = {
  id: "w1",
  clinic_id: "clinic-1",
  exchange_config_id: "ex1",
  wallet_address: "bc1q...",
  coin_type: "BTC",
  wallet_name: "Wallet BTC",
  balance: 0.5,
  balance_brl: 175000,
  is_active: true,
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
}

const mockTransaction = {
  id: "t1",
  clinic_id: "clinic-1",
  exchange_config_id: "ex1",
  wallet_id: "w1",
  patient_id: "p1",
  transaction_hash: "hash123",
  coin_type: "BTC",
  amount_crypto: 0.01,
  amount_brl: 3500,
  exchange_rate: 350000,
  tipo: "RECEBIMENTO",
  status: "CONFIRMADO",
  confirmations: 3,
  required_confirmations: 3,
  to_address: "bc1q...",
  processing_fee_brl: 52.5,
  net_amount_brl: 3447.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockPendingTx = {
  ...mockTransaction,
  id: "t2",
  status: "PENDENTE",
  confirmations: 0,
  amount_crypto: 0.02,
  amount_brl: 7000,
  created_at: new Date().toISOString(),
}

describe("useCrypto", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
    ;(fetchExchangeRateWithCache as any).mockReset()
  })

  // ─────────────────────────────────────────────────────────────
  // Mount / loading
  // ─────────────────────────────────────────────────────────────

  it("should start with loading true and then load data", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto("clinic-1"))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.exchanges).toHaveLength(1)
    expect(result.current.wallets).toHaveLength(1)
    expect(result.current.transactions).toHaveLength(1)
    expect(mockGet).toHaveBeenCalledWith("/crypto/exchanges?clinic_id=clinic-1")
    expect(mockGet).toHaveBeenCalledWith("/crypto/wallets?clinic_id=clinic-1")
    expect(mockGet).toHaveBeenCalledWith("/crypto/transactions?clinic_id=clinic-1")
  })

  it("should set loading to false when clinicId is empty", async () => {
    const { result } = renderHook(() => useCrypto(""))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exchanges).toHaveLength(0)
    expect(result.current.wallets).toHaveLength(0)
    expect(result.current.transactions).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should handle error when loading data fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useCrypto("clinic-1"))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.exchanges).toHaveLength(0)
    expect(result.current.wallets).toHaveLength(0)
    expect(result.current.transactions).toHaveLength(0)
  })

  // ─────────────────────────────────────────────────────────────
  // createExchangeConfig
  // ─────────────────────────────────────────────────────────────

  it("should create exchange config and reload data", async () => {
    mockGet
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    mockPost.mockResolvedValueOnce(mockExchange)
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newConfig = { exchange_name: "BINANCE" as const, processing_fee_percentage: 1 }

    await act(async () => {
      await result.current.createExchangeConfig(newConfig)
    })

    expect(mockPost).toHaveBeenCalledWith("/crypto/exchanges", expect.any(Object))
    expect(mockGet).toHaveBeenCalledTimes(6)
  })

  it("should throw on createExchangeConfig failure", async () => {
    mockGet
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.createExchangeConfig({})
      }),
    ).rejects.toThrow("Save failed")
  })

  // ─────────────────────────────────────────────────────────────
  // createWallet
  // ─────────────────────────────────────────────────────────────

  it("should create wallet and reload data", async () => {
    mockGet
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    mockPost.mockResolvedValueOnce(mockWallet)
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newWallet = { wallet_address: "bc1q...", coin_type: "BTC" as const, wallet_name: "Nova" }

    await act(async () => {
      await result.current.createWallet(newWallet)
    })

    expect(mockPost).toHaveBeenCalledWith("/crypto/wallets", expect.any(Object))
    expect(mockGet).toHaveBeenCalledTimes(6)
  })

  it("should throw on createWallet failure", async () => {
    mockGet
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.createWallet({})
      }),
    ).rejects.toThrow("Save failed")
  })

  // ─────────────────────────────────────────────────────────────
  // syncWalletBalance
  // ─────────────────────────────────────────────────────────────

  it("should sync wallet balance and reload data", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])
    mockPost.mockResolvedValueOnce({ success: true })
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([{ ...mockWallet, balance: 1.0 }])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.syncWalletBalance("w1")
    })

    expect(mockPost).toHaveBeenCalledWith("/crypto/wallets/sync", { walletId: "w1" })
    expect(mockGet).toHaveBeenCalledTimes(6)
  })

  it("should throw on syncWalletBalance failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])
    mockPost.mockRejectedValueOnce(new Error("Sync failed"))

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.syncWalletBalance("w1")
      }),
    ).rejects.toThrow("Sync failed")
  })

  // ─────────────────────────────────────────────────────────────
  // createPaymentRequest
  // ─────────────────────────────────────────────────────────────

  it("should create payment request and reload data", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])
    ;(fetchExchangeRateWithCache as any).mockResolvedValueOnce(350000)
    mockPost.mockResolvedValueOnce(mockTransaction)
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createPaymentRequest({
        wallet_id: "w1",
        amount_crypto: 0.01,
      })
    })

    expect(fetchExchangeRateWithCache).toHaveBeenCalledWith("BTC")
    expect(mockPost).toHaveBeenCalledWith("/crypto/transactions", expect.any(Object))
    expect(mockGet).toHaveBeenCalledTimes(6)
  })

  it("should throw when wallet is not found on createPaymentRequest", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.createPaymentRequest({
          wallet_id: "w-unknown",
          amount_crypto: 0.01,
        })
      }),
    ).rejects.toThrow("Wallet not found")
  })

  it("should throw when clinicId is empty on createPaymentRequest", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto(""))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.createPaymentRequest({
          wallet_id: "w1",
          amount_crypto: 0.01,
        })
      }),
    ).rejects.toThrow("Clinic ID required")
  })

  // ─────────────────────────────────────────────────────────────
  // convertCryptoToBRL
  // ─────────────────────────────────────────────────────────────

  it("should convert crypto to BRL and reload data", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])
    mockPost.mockResolvedValueOnce({ success: true })
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([{ ...mockTransaction, status: "CONVERTIDO" }])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.convertCryptoToBRL("t1")
    })

    expect(mockPost).toHaveBeenCalledWith("/crypto/convert", { transactionId: "t1" })
    expect(mockGet).toHaveBeenCalledTimes(6)
  })

  it("should throw on convertCryptoToBRL failure", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])
    mockPost.mockRejectedValueOnce(new Error("Convert failed"))

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.convertCryptoToBRL("t1")
      }),
    ).rejects.toThrow("Convert failed")
  })

  // ─────────────────────────────────────────────────────────────
  // getDashboardData
  // ─────────────────────────────────────────────────────────────

  it("should return correct dashboard data", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction, mockPendingTx])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const dashboard = result.current.getDashboardData()

    expect(dashboard.totalBTC).toBe(0.01)
    expect(dashboard.totalBRL).toBe(3500)
    expect(dashboard.pendingTransactions).toBe(1)
    expect(dashboard.confirmedToday).toBe(1)
  })

  it("should return zero dashboard data when no transactions", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const dashboard = result.current.getDashboardData()

    expect(dashboard.totalBTC).toBe(0)
    expect(dashboard.totalBRL).toBe(0)
    expect(dashboard.pendingTransactions).toBe(0)
    expect(dashboard.confirmedToday).toBe(0)
  })

  // ─────────────────────────────────────────────────────────────
  // reload
  // ─────────────────────────────────────────────────────────────

  it("should reload data when reload is called", async () => {
    mockGet
      .mockResolvedValueOnce([mockExchange])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])
    mockGet
      .mockResolvedValueOnce([{ ...mockExchange, exchange_name: "COINBASE" }])
      .mockResolvedValueOnce([mockWallet])
      .mockResolvedValueOnce([mockTransaction])

    const { result } = renderHook(() => useCrypto("clinic-1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.reload()
    })

    expect(mockGet).toHaveBeenCalledTimes(6)
    expect(result.current.exchanges[0].exchange_name).toBe("COINBASE")
  })
})
