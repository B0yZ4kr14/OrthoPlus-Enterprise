import { useStepActivation } from "./useStepActivation";
import { InfoCard } from "./InfoCard";
import { StatsBar } from "./StatsBar";
import { ModuleCategory } from "./ModuleCategory";

export function StepActivation() {
  const { activeModules, groupedModules, stats, toggleModule } =
    useStepActivation();

  return (
    <div className="space-y-6">
      <InfoCard />
      <StatsBar
        active={stats.active}
        total={stats.total}
        inactive={stats.inactive}
      />

      <div className="space-y-6">
        {Object.entries(groupedModules).map(([category, modules]) => (
          <ModuleCategory
            key={category}
            category={category}
            modules={modules}
            activeModules={activeModules}
            onToggle={toggleModule}
          />
        ))}
      </div>
    </div>
  );
}
