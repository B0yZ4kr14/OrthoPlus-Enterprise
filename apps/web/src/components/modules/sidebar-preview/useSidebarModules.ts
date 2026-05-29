import { useMemo } from "react";
import type { Module } from "./types";

export function useSidebarModules(modules: Module[]) {
  const activeModules = useMemo(
    () => modules.filter((m) => m.is_active),
    [modules],
  );

  const groupedModules = useMemo(() => {
    return activeModules.reduce(
      (acc, module) => {
        const category = module.category || "Outros";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(module);
        return acc;
      },
      {} as Record<string, Module[]>,
    );
  }, [activeModules]);

  return {
    activeModules,
    groupedModules,
  };
}
