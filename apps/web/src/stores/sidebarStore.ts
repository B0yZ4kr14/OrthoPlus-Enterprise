/**
 * sidebarStore — Zustand store para estado de colapso/expansão das categorias da sidebar
 *
 * Substitui o SidebarCategoryContext (React Context) para alinhar com Constitution FE-4.
 * Persistência via Zustand persist middleware (localStorage) — alinha com Constitution FE-3.
 * Validação de schema via Zod — ARCH-003.
 */

import { create } from "zustand"
import { z } from "zod"
import { useAuth } from "@/contexts/AuthContext"
import { useLocation } from "react-router-dom"
import { useEffect, useRef, useCallback } from "react"
import { menuGroups } from "@/core/layout/Sidebar/sidebar.config"

// ─── Zod Schema for Persisted State ───────────────────────────────────────

const persistedSidebarSchema = z.object({
  state: z.object({
    expandedGroups: z.array(z.string()).default([]),
  }),
  version: z.number().optional(),
})

function validatePersistedState(raw: unknown): { expandedGroups: string[] } | null {
  try {
    const parsed = persistedSidebarSchema.parse(raw)
    return parsed.state
  } catch {
    return null
  }
}

// ─── Store Interface ──────────────────────────────────────────────────────

interface SidebarState {
  expandedGroups: string[]
  toggleGroup: (boundedContext: string) => void
  isExpanded: (boundedContext: string) => boolean
  expandGroup: (boundedContext: string) => void
  collapseGroup: (boundedContext: string) => void
  setExpandedGroups: (groups: string[]) => void
}

function getActiveBoundedContext(pathname: string): string | null {
  for (const group of menuGroups) {
    for (const item of group.items) {
      if (item.url && pathname.startsWith(item.url)) {
        return group.boundedContext
      }
    }
  }
  return null
}

const STORAGE_KEY_PREFIX = "orthoplus:sidebar:groups"

function buildStorageKey(userId: string | undefined, clinicId: string | null): string {
  const uid = userId || "anonymous"
  const cid = clinicId || "no-clinic"
  return `${STORAGE_KEY_PREFIX}:${uid}:${cid}`
}

function loadPersistedState(key: string): string[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const validated = validatePersistedState(parsed)
    return validated?.expandedGroups ?? null
  } catch {
    return null
  }
}

function savePersistedState(key: string, expandedGroups: string[]) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ state: { expandedGroups }, version: 1 }),
    )
  } catch (err) {
    console.warn("[sidebarStore] Failed to save state:", err)
  }
}

/** Migrate from legacy key (without user/clinic isolation) to scoped key */
function migrateLegacyState(newKey: string): string[] | null {
  try {
    const legacyRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}-storage`)
    if (!legacyRaw) return null
    const parsed = JSON.parse(legacyRaw)
    const validated = validatePersistedState(parsed)
    if (validated) {
      // Save to new scoped key
      savePersistedState(newKey, validated.expandedGroups)
      // Clear legacy key to prevent cross-user leakage
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}-storage`)
      console.info("[sidebarStore] Migrated legacy state to scoped key")
      return validated.expandedGroups
    }
  } catch {
    // ignore
  }
  return null
}

export const useSidebarStore = create<SidebarState>()((set, get) => ({
  expandedGroups: [],

  setExpandedGroups: (groups: string[]) => {
    set({ expandedGroups: groups })
  },

  toggleGroup: (boundedContext: string) => {
    set((state) => {
      const next = new Set(state.expandedGroups)
      if (next.has(boundedContext)) {
        next.delete(boundedContext)
      } else {
        next.add(boundedContext)
      }
      return { expandedGroups: Array.from(next) }
    })
  },

  isExpanded: (boundedContext: string) => {
    return get().expandedGroups.includes(boundedContext)
  },

  expandGroup: (boundedContext: string) => {
    set((state) => {
      if (state.expandedGroups.includes(boundedContext)) return state
      return {
        expandedGroups: [...state.expandedGroups, boundedContext],
      }
    })
  },

  collapseGroup: (boundedContext: string) => {
    set((state) => ({
      expandedGroups: state.expandedGroups.filter(
        (g) => g !== boundedContext,
      ),
    }))
  },
}))

/**
 * Hook que integra o store com roteamento, auto-expand e persistência
 * por usuário + clínica (multi-tenant isolation).
 */
export function useSidebarCategory(): Pick<
  SidebarState,
  "expandedGroups" | "toggleGroup" | "isExpanded"
> {
  const { user, clinicId } = useAuth()
  const { pathname } = useLocation()

  const store = useSidebarStore()
  const manuallyCollapsedRef = useRef<Set<string>>(new Set())
  const storageKeyRef = useRef<string>("")

  // Load persisted state on user/clinic change
  useEffect(() => {
    const key = buildStorageKey(user?.id, clinicId)
    storageKeyRef.current = key

    // Try scoped key first
    let groups = loadPersistedState(key)

    // Fall back to legacy key (migration)
    if (groups === null && user?.id && clinicId) {
      groups = migrateLegacyState(key)
    }

    if (groups !== null) {
      store.setExpandedGroups(groups)
    } else {
      store.setExpandedGroups([])
    }
  }, [user?.id, clinicId, store])

  // Persist state on every change
  useEffect(() => {
    const key = storageKeyRef.current
    if (!key) return
    savePersistedState(key, store.expandedGroups)
  }, [store.expandedGroups])

  // Auto-expand active category on route change, but respect manual toggles
  useEffect(() => {
    const active = getActiveBoundedContext(pathname)
    if (active && !manuallyCollapsedRef.current.has(active)) {
      store.expandGroup(active)
    }
  }, [pathname, store])

  const toggleGroup = useCallback(
    (boundedContext: string) => {
      const isCurrentlyExpanded = store.isExpanded(boundedContext)
      if (isCurrentlyExpanded) {
        manuallyCollapsedRef.current.add(boundedContext)
      } else {
        manuallyCollapsedRef.current.delete(boundedContext)
      }
      store.toggleGroup(boundedContext)
    },
    [store],
  )

  return {
    expandedGroups: store.expandedGroups,
    toggleGroup,
    isExpanded: store.isExpanded,
  }
}
