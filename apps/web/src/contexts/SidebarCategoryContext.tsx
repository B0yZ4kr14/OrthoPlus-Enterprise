/**
 * SidebarCategoryContext — Gerencia estado de colapso/expansão das categorias da sidebar
 *
 * Persistência via localStorage com chave user-scoped.
 * Comportamento padrão: todas as categorias recolhidas.
 * Categoria ativa é expandida automaticamente.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { menuGroups } from "@/core/layout/Sidebar/sidebar.config";

interface SidebarCategoryContextValue {
  expandedGroups: Set<string>;
  toggleGroup: (boundedContext: string) => void;
  isExpanded: (boundedContext: string) => boolean;
}

const SidebarCategoryContext = createContext<SidebarCategoryContextValue | null>(
  null,
);

const STORAGE_KEY_PREFIX = "orthoplus:sidebar:groups";

function getStorageKey(userId: string | undefined): string {
  return `${STORAGE_KEY_PREFIX}:${userId ?? "anonymous"}`;
}

function loadExpandedGroups(userId: string | undefined): Set<string> {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function saveExpandedGroups(
  userId: string | undefined,
  groups: Set<string>,
): void {
  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(Array.from(groups)),
    );
  } catch {
    // localStorage indisponível (private mode) — ignora silenciosamente
  }
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

interface SidebarCategoryProviderProps {
  children: ReactNode;
}

export function SidebarCategoryProvider({
  children,
}: SidebarCategoryProviderProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const userId = user?.id;

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() =>
    loadExpandedGroups(userId),
  );

  // Auto-expand active category on route change
  useEffect(() => {
    const active = getActiveBoundedContext(pathname);
    if (active) {
      setExpandedGroups((prev) => {
        if (prev.has(active)) return prev;
        const next = new Set(prev);
        next.add(active);
        return next;
      });
    }
  }, [pathname]);

  const toggleGroup = useCallback(
    (boundedContext: string) => {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        if (next.has(boundedContext)) {
          next.delete(boundedContext);
        } else {
          next.add(boundedContext);
        }
        saveExpandedGroups(userId, next);
        return next;
      });
    },
    [userId],
  );

  const isExpanded = useCallback(
    (boundedContext: string) => expandedGroups.has(boundedContext),
    [expandedGroups],
  );

  const value = useMemo(
    () => ({ expandedGroups, toggleGroup, isExpanded }),
    [expandedGroups, toggleGroup, isExpanded],
  );

  return (
    <SidebarCategoryContext.Provider value={value}>
      {children}
    </SidebarCategoryContext.Provider>
  );
}

export function useSidebarCategory(): SidebarCategoryContextValue {
  const ctx = useContext(SidebarCategoryContext);
  if (!ctx) {
    throw new Error(
      "useSidebarCategory must be used within SidebarCategoryProvider",
    );
  }
  return ctx;
}
