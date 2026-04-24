import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { SimulationModule } from "./types";
import { SIMULATION_MODULES } from "./types";

export function useModuleSimulation() {
  const [modules, setModules] = useState<SimulationModule[]>(SIMULATION_MODULES);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const canDeactivate = useCallback((moduleId: string, currentModules: SimulationModule[]) => {
    const dependents = currentModules.filter(
      (m) => m.active && m.requires?.includes(moduleId),
    );
    return dependents.length === 0;
  }, []);

  const canActivate = useCallback((moduleId: string, currentModules: SimulationModule[]) => {
    const module = currentModules.find((m) => m.id === moduleId);
    if (!module?.requires) return true;

    return module.requires.every(
      (req) => currentModules.find((m) => m.id === req)?.active,
    );
  }, []);

  const toggleModule = useCallback((moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    if (module.active) {
      if (!canDeactivate(moduleId, modules)) {
        const dependents = modules
          .filter((m) => m.active && m.requires?.includes(moduleId))
          .map((m) => m.name);

        toast.error(`Não é possível desativar ${module.name}`, {
          description: `Desative primeiro: ${dependents.join(", ")}`,
        });
        setLastAction(`❌ Falha ao desativar ${module.name} (dependências ativas)`);
        return;
      }

      setModules(modules.map((m) => (m.id === moduleId ? { ...m, active: false } : m)));
      toast.success(`${module.name} desativado`);
      setLastAction(`✅ ${module.name} desativado com sucesso`);
    } else {
      if (!canActivate(moduleId, modules)) {
        const missing =
          module.requires
            ?.filter((req) => !modules.find((m) => m.id === req)?.active)
            .map((req) => modules.find((m) => m.id === req)?.name) || [];

        toast.error(`Não é possível ativar ${module.name}`, {
          description: `Ative primeiro: ${missing.join(", ")}`,
        });
        setLastAction(`❌ Falha ao ativar ${module.name} (dependências inativas)`);
        return;
      }

      setModules(modules.map((m) => (m.id === moduleId ? { ...m, active: true } : m)));
      toast.success(`${module.name} ativado`);
      setLastAction(`✅ ${module.name} ativado com sucesso`);
    }
  }, [modules, canActivate, canDeactivate]);

  const resetSimulation = useCallback(() => {
    setModules(SIMULATION_MODULES);
    setLastAction(null);
    toast.info("Simulação reiniciada");
  }, []);

  return {
    modules,
    lastAction,
    toggleModule,
    resetSimulation,
    canActivate,
    canDeactivate,
  };
}
