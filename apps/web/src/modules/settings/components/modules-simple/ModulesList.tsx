// cspell:disable
import { ModuleCard } from "./ModuleCard";
import type { Module } from "./types";

interface ModulesListProps {
  categories: string[];
  groupedModules: Record<string, Module[]>;
  allModules: Module[];
  toggling: string | null;
  expandedModule: string | null;
  onToggle: (moduleKey: string) => void;
  onExpand: (moduleKey: string) => void;
}

export function ModulesList({
  categories,
  groupedModules,
  allModules,
  toggling,
  expandedModule,
  onToggle,
  onExpand,
}: ModulesListProps) {
  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{category}</h2>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid gap-3">
            {groupedModules[category].map((module) => (
              <ModuleCard
                key={module.module_key}
                module={module}
                isToggling={toggling === module.module_key}
                isExpanded={expandedModule === module.module_key}
                allModules={allModules}
                onToggle={onToggle}
                onExpand={onExpand}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
