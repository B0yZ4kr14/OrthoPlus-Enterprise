import { useMemo } from "react";
import { SHORTCUTS } from "./SHORTCUTS";

export function useShortcuts() {
  const categories = useMemo(
    () => [...new Set(SHORTCUTS.map((s) => s.category))],
    [],
  );

  const getShortcutsByCategory = (category: string) =>
    SHORTCUTS.filter((s) => s.category === category);

  return {
    categories,
    getShortcutsByCategory,
  };
}
