import { useState, useMemo, useCallback } from "react";
import { SAMPLE_MODULES } from "./types";

export function useStepActivation() {
  const [activeModules, setActiveModules] = useState<string[]>(
    SAMPLE_MODULES.filter((m) => m.essential).map((m) => m.id),
  );

  const toggleModule = useCallback((id: string) => {
    const module = SAMPLE_MODULES.find((m) => m.id === id);
    if (module?.essential) return;

    setActiveModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }, []);

  const groupedModules = useMemo(() => {
    return SAMPLE_MODULES.reduce(
      (acc, module) => {
        if (!acc[module.category]) {
          acc[module.category] = [];
        }
        acc[module.category].push(module);
        return acc;
      },
      {} as Record<string, typeof SAMPLE_MODULES>,
    );
  }, []);

  const stats = useMemo(
    () => ({
      active: activeModules.length,
      total: SAMPLE_MODULES.length,
      inactive: SAMPLE_MODULES.length - activeModules.length,
    }),
    [activeModules.length],
  );

  return {
    activeModules,
    groupedModules,
    stats,
    toggleModule,
  };
}
