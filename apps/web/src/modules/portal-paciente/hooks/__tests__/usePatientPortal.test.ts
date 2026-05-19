import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

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
const mockPut = vi.fn()

vi.mock("@/lib/api/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
}))

import { toast } from "sonner"
import { usePatientPortal } from "../usePatientPortal"

const mockNotification = {
  id: "n1",
  patient_id: "p1",
  tipo: "CONSULTA_AGENDADA" as const,
  titulo: "Consulta Agendada",
  mensagem: "Sua consulta foi agendada para amanhã",
  lida: false,
  link_acao: "/consultas/1",
}

const mockNotificationRead = {
  ...mockNotification,
  id: "n2",
  lida: true,
}

const mockMessage = {
  id: "m1",
  clinic_id: "c1",
  patient_id: "p1",
  remetente_tipo: "CLINICA" as const,
  remetente_id: "d1",
  mensagem: "Olá, tudo bem?",
  lida: false,
}

const mockPreferences = {
  id: "pref1",
  patient_id: "p1",
  notificacoes_email: true,
  notificacoes_sms: false,
  notificacoes_whatsapp: true,
  notificacoes_push: false,
  lembrete_consulta_horas: 24,
  idioma: "pt-BR",
  tema: "light",
}

describe("usePatientPortal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPatch.mockReset()
    mockPut.mockReset()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ─────────────────────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────────────────────

  it("should load notifications and preferences on mount when patientId is provided", async () => {
    mockGet.mockResolvedValueOnce([mockNotification, mockNotificationRead])
    mockGet.mockResolvedValueOnce(mockPreferences)

    const { result } = renderHook(() => usePatientPortal("p1"))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.notifications).toHaveLength(2)
    expect(result.current.notifications[0].titulo).toBe("Consulta Agendada")
    expect(result.current.unreadCount).toBe(1)
    expect(result.current.preferences).toEqual(mockPreferences)
    expect(mockGet).toHaveBeenCalledWith("/portal-paciente/p1/notificacoes")
    expect(mockGet).toHaveBeenCalledWith("/portal-paciente/p1/preferencias")
  })

  it("should not fetch data when patientId is undefined", async () => {
    const { result } = renderHook(() => usePatientPortal())

    expect(result.current.loading).toBe(true)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("should show toast.error when loading notifications fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"))
    mockGet.mockResolvedValueOnce(mockPreferences)

    const { result } = renderHook(() => usePatientPortal("p1"))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar notificações")
  })

  // ─────────────────────────────────────────────────────────────
  // loadMessages
  // ─────────────────────────────────────────────────────────────

  it("should load messages when clinicId is provided", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockGet.mockResolvedValueOnce([mockMessage])

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.loadMessages("c1")
    })

    expect(mockGet).toHaveBeenCalledWith("/portal-paciente/p1/mensagens", {
      params: { clinic_id: "c1" },
    })
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].mensagem).toBe("Olá, tudo bem?")
  })

  it("should not load messages when patientId is undefined", async () => {
    const { result } = renderHook(() => usePatientPortal())

    await act(async () => {
      await result.current.loadMessages("c1")
    })

    expect(mockGet).not.toHaveBeenCalledWith(
      "/portal-paciente/undefined/mensagens",
      expect.any(Object),
    )
  })

  it("should show toast.error when loading messages fails", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockGet.mockRejectedValueOnce(new Error("Network error"))

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.loadMessages("c1")
    })

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar mensagens")
  })

  // ─────────────────────────────────────────────────────────────
  // markAsRead
  // ─────────────────────────────────────────────────────────────

  it("should mark a notification as read and reload notifications", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPatch.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([{ ...mockNotification, lida: true }])

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markAsRead("n1")
    })

    expect(mockPatch).toHaveBeenCalledWith(
      "/portal-paciente/p1/notificacoes/n1/lida",
      {},
    )
    expect(mockGet).toHaveBeenCalledTimes(3)
  })

  it("should handle error when marking as read fails", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPatch.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markAsRead("n1")
    })

    expect(mockPatch).toHaveBeenCalledWith(
      "/portal-paciente/p1/notificacoes/n1/lida",
      {},
    )
  })

  // ─────────────────────────────────────────────────────────────
  // markAllAsRead
  // ─────────────────────────────────────────────────────────────

  it("should mark all notifications as read and show success toast", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPatch.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([])

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markAllAsRead()
    })

    expect(mockPatch).toHaveBeenCalledWith(
      "/portal-paciente/p1/notificacoes/marcar-todas-lidas",
      {},
    )
    expect(toast.success).toHaveBeenCalledWith(
      "Todas as notificações foram marcadas como lidas",
    )
  })

  it("should not call API when patientId is null on markAllAsRead", async () => {
    const { result } = renderHook(() => usePatientPortal())

    await act(async () => {
      await result.current.markAllAsRead()
    })

    expect(mockPatch).not.toHaveBeenCalled()
  })

  it("should show toast.error when markAllAsRead fails", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPatch.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markAllAsRead()
    })

    expect(toast.error).toHaveBeenCalledWith(
      "Erro ao marcar notificações como lidas",
    )
  })

  // ─────────────────────────────────────────────────────────────
  // sendMessage
  // ─────────────────────────────────────────────────────────────

  it("should send a message and reload messages", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPost.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([mockMessage])

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const success = await act(async () =>
      result.current.sendMessage("c1", "Olá", "PACIENTE", "p1"),
    )

    expect(success).toBe(true)
    expect(mockPost).toHaveBeenCalledWith(
      "/portal-paciente/p1/mensagens",
      {
        clinic_id: "c1",
        remetente_tipo: "PACIENTE",
        remetente_id: "p1",
        mensagem: "Olá",
      },
    )
  })

  it("should return false when sendMessage fails", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPost.mockRejectedValueOnce(new Error("Send failed"))

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const success = await act(async () =>
      result.current.sendMessage("c1", "Olá", "PACIENTE", "p1"),
    )

    expect(success).toBe(false)
    expect(toast.error).toHaveBeenCalledWith("Erro ao enviar mensagem")
  })

  it("should not send message when patientId is undefined", async () => {
    const { result } = renderHook(() => usePatientPortal())

    const success = await act(async () =>
      result.current.sendMessage("c1", "Olá", "PACIENTE", "p1"),
    )

    expect(success).toBeUndefined()
    expect(mockPost).not.toHaveBeenCalled()
  })

  // ─────────────────────────────────────────────────────────────
  // updatePreferences
  // ─────────────────────────────────────────────────────────────

  it("should update preferences and reload them", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPut.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce({ ...mockPreferences, tema: "dark" })

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const success = await act(async () =>
      result.current.updatePreferences({ tema: "dark" }),
    )

    expect(success).toBe(true)
    expect(mockPut).toHaveBeenCalledWith(
      "/portal-paciente/p1/preferencias",
      { tema: "dark" },
    )
    expect(toast.success).toHaveBeenCalledWith(
      "Preferências atualizadas com sucesso!",
    )
    expect(result.current.preferences?.tema).toBe("dark")
  })

  it("should return false when updatePreferences fails", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPut.mockRejectedValueOnce(new Error("Update failed"))

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const success = await act(async () =>
      result.current.updatePreferences({ tema: "dark" }),
    )

    expect(success).toBe(false)
    expect(toast.error).toHaveBeenCalledWith("Erro ao atualizar preferências")
  })

  it("should not update preferences when patientId is undefined", async () => {
    const { result } = renderHook(() => usePatientPortal())

    const success = await act(async () =>
      result.current.updatePreferences({ tema: "dark" }),
    )

    expect(success).toBeUndefined()
    expect(mockPut).not.toHaveBeenCalled()
  })

  // ─────────────────────────────────────────────────────────────
  // createNotification
  // ─────────────────────────────────────────────────────────────

  it("should create a notification and reload notifications", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPost.mockResolvedValueOnce({})
    mockGet.mockResolvedValueOnce([mockNotification, mockNotification])

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newNotification = {
      tipo: "LEMBRETE_CONSULTA" as const,
      titulo: "Lembrete",
      mensagem: "Não esqueça da consulta",
    }

    const success = await act(async () =>
      result.current.createNotification(newNotification),
    )

    expect(success).toBe(true)
    expect(mockPost).toHaveBeenCalledWith(
      "/portal-paciente/p1/notificacoes",
      newNotification,
    )
  })

  it("should return false when createNotification fails", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockPost.mockRejectedValueOnce(new Error("Create failed"))

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const success = await act(async () =>
      result.current.createNotification({ titulo: "Test" }),
    )

    expect(success).toBe(false)
    expect(toast.error).toHaveBeenCalledWith("Erro ao criar notificação")
  })

  // ─────────────────────────────────────────────────────────────
  // Polling
  // ─────────────────────────────────────────────────────────────

  it("should poll notifications every 30 seconds", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)

    renderHook(() => usePatientPortal("p1"))

    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2))

    // Advance 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000)
    })

    expect(mockGet).toHaveBeenCalledTimes(3)
    expect(mockGet).toHaveBeenNthCalledWith(
      3,
      "/portal-paciente/p1/notificacoes",
    )
  })

  // ─────────────────────────────────────────────────────────────
  // refreshNotifications
  // ─────────────────────────────────────────────────────────────

  it("should refresh notifications when called", async () => {
    mockGet.mockResolvedValueOnce([mockNotification])
    mockGet.mockResolvedValueOnce(mockPreferences)
    mockGet.mockResolvedValueOnce([mockNotificationRead])

    const { result } = renderHook(() => usePatientPortal("p1"))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.refreshNotifications()
    })

    expect(mockGet).toHaveBeenCalledTimes(3)
    expect(mockGet).toHaveBeenNthCalledWith(
      3,
      "/portal-paciente/p1/notificacoes",
    )
  })
})
