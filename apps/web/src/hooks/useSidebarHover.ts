import { useCallback, useEffect, useRef, useState } from "react"

const ENTER_DELAY_MS = 120
const LEAVE_DEBOUNCE_MS = 350

interface UseSidebarHoverReturn {
  /** Sidebar visível por hover */
  isOpen: boolean
  /** Sidebar está em modo auto-hide (oculta por padrão) */
  isAutoHide: boolean
  /** Handler para mouse enter no trigger ou sidebar */
  onMouseEnter: () => void
  /** Handler para mouse leave da sidebar */
  onMouseLeave: () => void
  /** Alternar modo auto-hide / fixo */
  toggleAutoHide: () => void
}

/**
 * Hook que gerencia o modo hover auto-hide da sidebar.
 *
 * Quando `isAutoHide = true` (padrão), a sidebar fica completamente oculta
 * e aparece ao passar o mouse sobre a área de trigger na lateral esquerda.
 * Quando `isAutoHide = false`, a sidebar permanece visível (modo fixo).
 *
 * O estado de auto-hide é persistido no localStorage.
 */
export function useSidebarHover(): UseSidebarHoverReturn {
  const [isAutoHide, setIsAutoHide] = useState(() => {
    try {
      const raw = localStorage.getItem("orthoplus:sidebar:auto-hide")
      return raw !== "false" // padrão: true (auto-hide ativado)
    } catch {
      return true
    }
  })

  const [hoverOpen, setHoverOpen] = useState(false)
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current)
      enterTimeoutRef.current = null
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
  }, [])

  const onMouseEnter = useCallback(() => {
    if (!isAutoHide) return
    clearTimers()
    enterTimeoutRef.current = setTimeout(() => {
      setHoverOpen(true)
    }, ENTER_DELAY_MS)
  }, [isAutoHide, clearTimers])

  const onMouseLeave = useCallback(() => {
    if (!isAutoHide) return
    clearTimers()
    leaveTimeoutRef.current = setTimeout(() => {
      setHoverOpen(false)
    }, LEAVE_DEBOUNCE_MS)
  }, [isAutoHide, clearTimers])

  const toggleAutoHide = useCallback(() => {
    setIsAutoHide((prev) => {
      const next = !prev
      try {
        localStorage.setItem("orthoplus:sidebar:auto-hide", String(next))
      } catch {
        // ignore
      }
      return next
    })
    clearTimers()
    setHoverOpen(false)
  }, [clearTimers])

  // Quando alternar para modo fixo, limpar hover state
  useEffect(() => {
    if (!isAutoHide) {
      clearTimers()
      setHoverOpen(false)
    }
  }, [isAutoHide, clearTimers])

  // Intercept Ctrl+B para alternar auto-hide em vez do comportamento padrão do provider
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleAutoHide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleAutoHide])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  const isOpen = !isAutoHide || hoverOpen

  return {
    isOpen,
    isAutoHide,
    onMouseEnter,
    onMouseLeave,
    toggleAutoHide,
  }
}
