import { Button } from "@orthoplus/core-ui/button";
import { RefreshCw } from "lucide-react";
import { useModuleSimulation } from "./useModuleSimulation";
import { SimulationAlert } from "./SimulationAlert";
import { ActionLog } from "./ActionLog";
import { ModuleCard } from "./ModuleCard";
import { InstructionsCard } from "./InstructionsCard";

export function StepSimulation() {
  const {
    modules,
    lastAction,
    toggleModule,
    resetSimulation,
    canActivate,
    canDeactivate,
  } = useModuleSimulation();

  return (
    <div className="space-y-6">
      <SimulationAlert />
      <ActionLog action={lastAction} />

      <div className="space-y-3">
        {modules.map((module) => {
          const canToggle = module.active
            ? canDeactivate(module.id, modules)
            : canActivate(module.id, modules);

          const dependents = module.active
            ? modules.filter((m) => m.active && m.requires?.includes(module.id))
            : [];

          const missingDeps =
            !module.active && module.requires
              ? module.requires.filter(
                  (req) => !modules.find((m) => m.id === req)?.active,
                )
              : [];

          return (
            <ModuleCard
              key={module.id}
              module={module}
              canToggle={canToggle}
              dependents={dependents}
              missingDeps={missingDeps}
              allModules={modules}
              onToggle={toggleModule}
            />
          );
        })}
      </div>

      <Button type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={resetSimulation}
      >
        <RefreshCw className="h-4 w-4" />
        Reiniciar Simulação
      </Button>

      <InstructionsCard />
    </div>
  );
}
