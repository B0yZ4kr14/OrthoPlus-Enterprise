/**
 * sidebarStore — Zustand store para estado de colapso/expansão das categorias da sidebar
 *
 * Substitui o SidebarCategoryContext (React Context) para alinhar com Constitution FE-4.
 * Persistência via Zustand persist middleware (localStorage) — alinha com Constitution FE-3.
 * Validação de schema via Zod — ARCH-003.
 */

import { create } from "zustand";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import { menuGroups } from "@/core/layout/Sidebar/sidebar.config";

// ─── Zod Schema for Persisted State ───────────────────────────────────────

const persistedSidebarSchema = z.object({
  state: z.object({
    expandedGroups: z.array(z.string()).default([]),
  }),
  version: z.number().optional(),
});

function validatePersistedState(
  raw: unknown,
): { expandedGroups: string[] } | null {
  try {
    const parsed = persistedSidebarSchema.parse(raw);
    return parsed.state;
  } catch (error) {
    console.error("[sidebarStore.validatePersistedState] failed:", error);
    return null;
  }
}

// ─── Store Interface ──────────────────────────────────────────────────────

interface SidebarState {
  expandedGroups: string[];
  toggleGroup: (boundedContext: string) => void;
  isExpanded: (boundedContext: string) => boolean;
  expandGroup: (boundedContext: string) => void;
  collapseGroup: (boundedContext: string) => void;
  setExpandedGroups: (groups: string[]) => void;
}

function getActiveBoundedContext(pathname: string): string | null {
  for (const group of menuGroups) {
    for (const item of group.items) {
      if (item.url && pathname.startsWith(item.url)) {
        return group.boundedContext;
      }
    }
  }
  return null;
}

const STORAGE_KEY_PREFIX = "orthoplus:sidebar:groups";

function buildStorageKey(
  userId: string | undefined,
  clinicId: string | null,
): string {
  const uid = userId || "anonymous";
  const cid = clinicId || "no-clinic";
  return `${STORAGE_KEY_PREFIX}:${uid}:${cid}`;
}

function loadPersistedState(key: string): string[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validated = validatePersistedState(parsed);
    return validated?.expandedGroups ?? null;
  } catch (error) {
    console.error("[sidebarStore.loadPersistedState] failed:", error);
    return null;
  }
}

function savePersistedState(key: string, expandedGroups: string[]) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ state: { expandedGroups }, version: 1 }),
    );
  } catch (err) {
    logger.warn("[sidebarStore] Failed to save state", { error: err });
  }
}

/** Migrate from legacy key (without user/clinic isolation) to scoped key */
function migrateLegacyState(newKey: string): string[] | null {
  try {
    const legacyRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}-storage`);
    if (!legacyRaw) return null;
    const parsed = JSON.parse(legacyRaw);
    const validated = validatePersistedState(parsed);
    if (validated) {
      // Save to new scoped key
      savePersistedState(newKey, validated.expandedGroups);
      // Clear legacy key to prevent cross-user leakage
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}-storage`);
      // migrated successfully
      return validated.expandedGroups;
    }
  } catch (error) {
    console.error("[sidebarStore.migrateLegacyState] failed:", error);
  }
  return null;
}

export const useSidebarStore = create<SidebarState>()((set, get) => ({
  expandedGroups: [],

  setExpandedGroups: (groups: string[]) => {
    set({ expandedGroups: groups });
  },

  toggleGroup: (boundedContext: string) => {
    set((state) => {
      const next = new Set(state.expandedGroups);
      if (next.has(boundedContext)) {
        next.delete(boundedContext);
      } else {
        next.add(boundedContext);
      }
      return { expandedGroups: Array.from(next) };
    });
  },

  isExpanded: (boundedContext: string) => {
    return get().expandedGroups.includes(boundedContext);
  },

  expandGroup: (boundedContext: string) => {
    set((state) => {
      if (state.expandedGroups.includes(boundedContext)) return state;
      return {
        expandedGroups: [...state.expandedGroups, boundedContext],
      };
    });
  },

  collapseGroup: (boundedContext: string) => {
    set((state) => ({
      expandedGroups: state.expandedGroups.filter((g) => g !== boundedContext),
    }));
  },
}));

/**
 * Hook de persistência: carrega/salva estado no localStorage com isolamento multi-tenant.
 */
function useSidebarPersistence(
  userId: string | undefined,
  clinicId: string | null,
): void {
  const storageKeyRef = useRef<string>("");
  const setExpandedGroups = useSidebarStore((s) => s.setExpandedGroups);
  const expandedGroups = useSidebarStore((s) => s.expandedGroups);

  // Load persisted state on user/clinic change
  useEffect(() => {
    const initStart = performance.now();
    const key = buildStorageKey(userId, clinicId);
    storageKeyRef.current = key;

    let groups = loadPersistedState(key);
    if (groups === null && userId && clinicId) {
      groups = migrateLegacyState(key);
    }

    setExpandedGroups(groups ?? []);

    // initialization complete
  }, [userId, clinicId, setExpandedGroups]);

  // Persist state on every change
  useEffect(() => {
    const key = storageKeyRef.current;
    if (!key) return;
    savePersistedState(key, expandedGroups);
  }, [expandedGroups]);
}

/**
 * Hook de auto-expand: expande a categoria ativa baseada na rota atual.
 */
function useSidebarAutoExpand(
  pathname: string,
  manuallyCollapsedRef: React.RefObject<Set<string>>,
): void {
  const expandGroup = useSidebarStore((s) => s.expandGroup);

  useEffect(() => {
    const active = getActiveBoundedContext(pathname);
    if (active && !manuallyCollapsedRef.current?.has(active)) {
      expandGroup(active);
    }
  }, [pathname, expandGroup, manuallyCollapsedRef]);
}

/**
 * Hook que integra o store com roteamento, auto-expand e persistência
 * por usuário + clínica (multi-tenant isolation).
 * Composition hook — delegates to useSidebarPersistence and useSidebarAutoExpand.
 */
export function useSidebarCategory(): Pick<
  SidebarState,
  "expandedGroups" | "toggleGroup" | "isExpanded"
> {
  const { user, clinicId } = useAuth();
  const { pathname } = useLocation();
  const store = useSidebarStore();
  const manuallyCollapsedRef = useRef<Set<string>>(new Set());

  useSidebarPersistence(user?.id, clinicId);
  useSidebarAutoExpand(pathname, manuallyCollapsedRef);

  const toggleGroup = useCallback(
    (boundedContext: string) => {
      const isCurrentlyExpanded = store.isExpanded(boundedContext);
      if (isCurrentlyExpanded) {
        manuallyCollapsedRef.current.add(boundedContext);
      } else {
        manuallyCollapsedRef.current.delete(boundedContext);
      }
      store.toggleGroup(boundedContext);
      // toggle tracked
    },
    [store],
  );

  return {
    expandedGroups: store.expandedGroups,
    toggleGroup,
    isExpanded: store.isExpanded,
  };
}
