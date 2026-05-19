import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

const authState = {
  user: { id: "user-1", email: "test@test.com" },
  clinicId: "clinic-1",
}

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

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

import { toast } from "sonner"
import { useCryptoPriceAlerts } from "../useCryptoPriceAlerts"

const mockAlert = {
  id: "a1",
  coin_type: "BTC",
  target_rate_brl: 400000,
  alert_type: "ABOVE" as const,
  notification_method: ["email"],
  is_active: true,
  last_triggered_at: null,
  created_at: "2024-01-01T00:00:00",
  stop_loss_enabled: false,
  auto_convert_on_trigger: false,
  conversion_percentage: 100,
  cascade_enabled: false,
  cascade_group_id: null,
  cascade_order: 0,
}

const mockAlert2 = {
  ...mockAlert,
  id: "a2",
  coin_type: "ETH",
  target_rate_brl: 20000,
  alert_type: "BELOW" as const,
  is_active: false,
}

describe("useCryptoPriceAlerts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockDelete.mockReset()
    authState.user = { id: "user-1", email: "test@test.com" }
    authState.clinicId = "clinic-1"
  })

  // ─────────────────────────────────────────────────────────────
  // Mount / loading
  // ─────────────────────────────────────────────────────────────

  it("should load alerts on mount", async () => {
    mockGet.mockResolvedValueOnce([mockAlert, mockAlert2])

    const { result } = renderHook(() => useCryptoPriceAlerts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.alerts).toHaveLength(2)
    expect(result.current.alerts[0].coin_type).toBe("BTC")
    expect(result.current.alerts[1].coin_type).toBe("ETH")
    expect(mockGet).toHaveBeenCalledWith("/crypto/price-alerts?clinic_id=clinic-1")
  })

  it("should not fetch alerts when clinicId is null", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => useCryptoPriceAlerts())

    // When clinicId is null, fetchAlerts returns early without setting loading false
    expect(result.current.loading).toBe(true)
    expect(result.current.alerts).toHaveLength(0)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should handle error when fetching alerts fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => useCryptoPriceAlerts())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.alerts).toHaveLength(0)
    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar alertas")
  })

  // ─────────────────────────────────────────────────────────────
  // createAlert
  // ─────────────────────────────────────────────────────────────

  it("should create an alert and refetch", async () => {
    mockGet.mockResolvedValueOnce([])
    mockPost.mockResolvedValueOnce({ id: "a3" })
    mockGet.mockResolvedValueOnce([mockAlert])

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newAlert = {
      coin_type: "BTC",
      target_rate_brl: 500000,
      alert_type: "ABOVE" as const,
      notification_method: ["email"],
      stop_loss_enabled: false,
      auto_convert_on_trigger: false,
      conversion_percentage: 100,
      cascade_enabled: false,
    }

    await act(async () => {
      await result.current.createAlert(newAlert)
    })

    expect(mockPost).toHaveBeenCalledWith("/crypto/price-alerts", expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith("Alerta criado com sucesso!")
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it("should show stop-loss success message when creating stop-loss alert", async () => {
    mockGet.mockResolvedValueOnce([])
    mockPost.mockResolvedValueOnce({ id: "a3" })
    mockGet.mockResolvedValueOnce([mockAlert])

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createAlert({
        coin_type: "BTC",
        target_rate_brl: 300000,
        alert_type: "BELOW" as const,
        notification_method: ["email"],
        stop_loss_enabled: true,
        auto_convert_on_trigger: true,
        conversion_percentage: 50,
        cascade_enabled: false,
      })
    })

    expect(toast.success).toHaveBeenCalledWith("Stop-Loss configurado com sucesso!")
  })

  it("should not create alert when clinicId or user is missing", async () => {
    authState.clinicId = null

    const { result } = renderHook(() => useCryptoPriceAlerts())

    await act(async () => {
      await result.current.createAlert({
        coin_type: "BTC",
        target_rate_brl: 500000,
        alert_type: "ABOVE" as const,
        notification_method: ["email"],
      } as any)
    })

    expect(mockPost).not.toHaveBeenCalled()
  })

  it("should show toast.error on createAlert failure", async () => {
    mockGet.mockResolvedValueOnce([])
    mockPost.mockRejectedValueOnce(new Error("Save failed"))

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createAlert({
        coin_type: "BTC",
        target_rate_brl: 500000,
        alert_type: "ABOVE" as const,
        notification_method: ["email"],
      } as any)
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao criar alerta")
  })

  // ─────────────────────────────────────────────────────────────
  // toggleAlert
  // ─────────────────────────────────────────────────────────────

  it("should toggle alert and refetch", async () => {
    mockGet.mockResolvedValueOnce([mockAlert])
    mockPatch.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([{ ...mockAlert, is_active: false }])

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.toggleAlert("a1", true)
    })

    expect(mockPatch).toHaveBeenCalledWith("/crypto/price-alerts/a1", { is_active: false })
    expect(toast.success).toHaveBeenCalledWith("Alerta desativado com sucesso!")
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it("should show activated message when toggling inactive alert", async () => {
    mockGet.mockResolvedValueOnce([mockAlert2])
    mockPatch.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([{ ...mockAlert2, is_active: true }])

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.toggleAlert("a2", false)
    })

    expect(mockPatch).toHaveBeenCalledWith("/crypto/price-alerts/a2", { is_active: true })
    expect(toast.success).toHaveBeenCalledWith("Alerta ativado com sucesso!")
  })

  it("should show toast.error on toggleAlert failure", async () => {
    mockGet.mockResolvedValueOnce([mockAlert])
    mockPatch.mockRejectedValueOnce(new Error("Toggle failed"))

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.toggleAlert("a1", true)
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar alerta")
  })

  // ─────────────────────────────────────────────────────────────
  // deleteAlert
  // ─────────────────────────────────────────────────────────────

  it("should delete alert and refetch", async () => {
    mockGet.mockResolvedValueOnce([mockAlert, mockAlert2])
    mockDelete.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([mockAlert2])

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteAlert("a1")
    })

    expect(mockDelete).toHaveBeenCalledWith("/crypto/price-alerts/a1")
    expect(toast.success).toHaveBeenCalledWith("Alerta excluído com sucesso!")
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it("should show toast.error on deleteAlert failure", async () => {
    mockGet.mockResolvedValueOnce([mockAlert])
    mockDelete.mockRejectedValueOnce(new Error("Delete failed"))

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteAlert("a1")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao excluir alerta")
  })

  // ─────────────────────────────────────────────────────────────
  // refetch
  // ─────────────────────────────────────────────────────────────

  it("should refetch alerts when refetch is called", async () => {
    mockGet.mockResolvedValueOnce([mockAlert])
    mockGet.mockResolvedValueOnce([mockAlert, mockAlert2])

    const { result } = renderHook(() => useCryptoPriceAlerts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockGet).toHaveBeenCalledTimes(2)
    expect(result.current.alerts).toHaveLength(2)
  })
})
