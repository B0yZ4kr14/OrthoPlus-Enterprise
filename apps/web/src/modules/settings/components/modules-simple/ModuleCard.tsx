// cspell:disable
import { Settings, AlertCircle } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Switch } from "@orthoplus/core-ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";
import { cn } from "@/lib/utils";
import { ModuleDependencyGraph } from "@/components/modules/ModuleDependencyGraph";
import type { Module } from "./types";
import { moduleIcons } from "./moduleIcons";

interface ModuleCardProps {
  module: Module;
  isToggling: boolean;
  isExpanded: boolean;
  allModules: Module[];
  onToggle: (moduleKey: string) => void;
  onExpand: (moduleKey: string) => void;
}

export function ModuleCard({
  module,
  isToggling,
  isExpanded,
  allModules,
  onToggle,
  onExpand,
}: ModuleCardProps) {
  const canToggle = module.is_active
    ? module.can_deactivate
    : module.can_activate;
  const hasWarnings =
    module.unmet_dependencies?.length || module.blocking_dependents?.length;

  const Icon = (moduleIcons[module.module_key] ||
    Settings) as React.ComponentType<{ className?: string }>;

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-md",
        module.is_active && "border-primary/50 bg-primary/5",
        isToggling && "opacity-60",
        hasWarnings && !canToggle && "border-warning/30",
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 shadow-md",
                module.is_active
                  ? "bg-gradient-to-br from-success/30 to-success/15 shadow-success/30 border-2 border-success/40"
                  : "bg-gradient-to-br from-muted to-muted/50 border-2 border-border",
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-all duration-300",
                  module.is_active
                    ? "text-success drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]"
                    : "text-muted-foreground",
                )}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{module.name}</h3>
                <Badge
                  variant={module.is_active ? "success" : "secondary"}
                  className="text-xs"
                >
                  {module.is_active ? "Ativo" : "Inativo"}
                </Badge>
                {hasWarnings && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onExpand(module.module_key)}
                        >
                          <AlertCircle className="h-4 w-4 text-warning" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver dependências</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {module.description}
              </p>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    checked={module.is_active}
                    disabled={!canToggle || isToggling}
                    onCheckedChange={() => onToggle(module.module_key)}
                  />
                </div>
              </TooltipTrigger>
              {!canToggle && (
                <TooltipContent>
                  <p className="text-xs">
                    {module.unmet_dependencies?.length
                      ? "Ative as dependências primeiro"
                      : "Desative os módulos dependentes primeiro"}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {isExpanded && (
          <ModuleDependencyGraph modules={module} allModules={allModules} />
        )}
      </div>
    </Card>
  );
}
