/**
 * sidebarStore — Zustand store para estado de colapso/expansão das categorias da sidebar
 *
 * Substitui o SidebarCategoryContext (React Context) para alinhar com Constitution FE-4.
 * Persistência via Zustand persist middleware (localStorage) — alinha com Constitution FE-3.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useAuth } from "@/contexts/AuthContext"
import { useLocation } from "react-router-dom"
import { useEffect, useRef, useCallback } from "react"
import { menuGroups } from "@/core/layout/Sidebar/sidebar.config"

interface SidebarState {
  expandedGroups: string[]
  toggleGroup: (boundedContext: string) => void
  isExpanded: (boundedContext: string) => boolean
  expandGroup: (boundedContext: string) => void
  collapseGroup: (boundedContext: string) => void
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

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      expandedGroups: [],

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
    }),
    {
      name: STORAGE_KEY_PREFIX,
      partialize: (state) => ({ expandedGroups: state.expandedGroups }),
    },
  ),
)

/**
 * Hook que integra o store com roteamento e auto-expand.
 * Substitui o SidebarCategoryProvider + useSidebarCategory.
 */
export function useSidebarCategory(): Pick<
  SidebarState,
  "expandedGroups" | "toggleGroup" | "isExpanded"
> {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const store = useSidebarStore()
  const manuallyCollapsedRef = useRef<Set<string>>(new Set())

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
