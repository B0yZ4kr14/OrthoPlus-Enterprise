import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Switch } from "@orthoplus/core-ui/switch";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";
import { AlertCircle, Check, Lock } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface ModuleCardProps {
  module: {
    id: number;
    module_key: string;
    name: string;
    description: string;
    icon: string;
    subscribed: boolean;
    is_active: boolean;
    can_activate: boolean;
    can_deactivate: boolean;
    unmet_dependencies: string[];
    active_dependents: string[];
  };
  onToggle: (moduleKey: string) => void;
}

export function ModuleCard({ module, onToggle }: ModuleCardProps) {
  // Get icon component dynamically
  const IconComponent =
    (LucideIcons as unknown)[module.icon] || LucideIcons.Package;

  const isDisabled =
    (!module.is_active && !module.can_activate) ||
    (module.is_active && !module.can_deactivate);

  const getTooltipContent = () => {
    if (
      !module.is_active &&
      !module.can_activate &&
      module.unmet_dependencies.length > 0
    ) {
      return `Requer o(s) módulo(s): ${module.unmet_dependencies.join(", ")}`;
    }
    if (
      module.is_active &&
      !module.can_deactivate &&
      module.active_dependents.length > 0
    ) {
      return `Este módulo é requerido por: ${module.active_dependents.join(", ")}`;
    }
    return null;
  };

  const tooltipContent = getTooltipContent();

  return (
    <Card
      className={`transition-all ${module.is_active ? "border-primary shadow-md" : "hover:shadow-sm"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg transition-colors ${module.is_active ? "bg-primary/10" : "bg-muted"}`}
            >
              <IconComponent
                className={`h-5 w-5 transition-colors ${module.is_active ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base leading-tight">
                {module.name.replace("Módulo de ", "")}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {module.is_active && (
                  <Badge variant="default" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                )}
                {!module.subscribed && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Não contratado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm line-clamp-2">
          {module.description}
        </CardDescription>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Status do módulo</span>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={module.is_active}
                      onCheckedChange={() => onToggle(module.module_key)}
                      disabled={isDisabled}
                    />
                    {isDisabled && tooltipContent && (
                      <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />
                    )}
                  </div>
                </TooltipTrigger>
                {tooltipContent && (
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">
                        {!module.is_active &&
                          !module.can_activate &&
                          "Não pode ativar"}
                        {module.is_active &&
                          !module.can_deactivate &&
                          "Não pode desativar"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tooltipContent}
                      </p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
