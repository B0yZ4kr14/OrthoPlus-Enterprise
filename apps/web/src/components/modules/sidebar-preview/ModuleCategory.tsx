import { Settings } from "lucide-react";
import { MODULE_ICONS } from "./moduleIcons";
import { CATEGORY_LABELS } from "./types";
import type { Module } from "./types";

interface ModuleCategoryProps {
  category: string;
  modules: Module[];
  showSeparator?: boolean;
}

function ModuleItem({ module }: { module: Module }) {
  const Icon = MODULE_ICONS[module.module_key] || Settings;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-sidebar-accent-foreground hover:bg-sidebar-accent hover:shadow-sm transition-all duration-200">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-xs font-medium truncate flex-1">
        {module.name.replace("Módulo de ", "")}
      </span>
    </div>
  );
}

export function ModuleCategory({
  category,
  modules,
  showSeparator,
}: ModuleCategoryProps) {
  return (
    <div className={showSeparator ? "pt-4 mt-4 border-t border-border/20" : ""}>
      <div className="space-y-1">
        <div className="px-2 py-1">
          <span className="text-[10px] font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>

        {modules.map((module) => (
          <ModuleItem key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}
