import { Badge } from "@orthoplus/core-ui/badge";
import { ModuleItem } from "./ModuleItem";
import type { Module } from "./types";

interface ModuleCategoryProps {
  category: string;
  modules: Module[];
  activeModules: string[];
  onToggle: (id: string) => void;
}

export function ModuleCategory({
  category,
  modules,
  activeModules,
  onToggle,
}: ModuleCategoryProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        {category}
        <Badge variant="outline">{modules.length}</Badge>
      </h3>

      <div className="space-y-2">
        {modules.map((module) => (
          <ModuleItem
            key={module.id}
            module={module}
            isActive={activeModules.includes(module.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
