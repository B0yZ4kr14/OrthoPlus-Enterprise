import React, { useRef } from "react";
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
import {
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Link2,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleData } from "./types";

interface ModuleCardProps {
  module: ModuleData;
  isToggling: boolean;
  onToggle: (moduleKey: string, currentState: boolean) => void;
  onRequest: (moduleKey: string, moduleName: string) => void;
}

function getModuleStatusIcon(module: ModuleData) {
  if (!module.is_subscribed) return null;
  if (module.is_active) {
    return <CheckCircle2 className="h-5 w-5 text-success" />;
  }
  return <XCircle className="h-5 w-5 text-muted-foreground" />;
}

function getModuleStatusColor(module: ModuleData) {
  if (!module.is_subscribed) return "border-muted";
  if (module.is_active) return "border-success/50 bg-success/5";
  return "border-muted";
}

function canToggle(module: ModuleData) {
  if (!module.is_subscribed) return false;
  if (module.is_active) return module.can_deactivate;
  return module.can_activate;
}

function getToggleTooltip(module: ModuleData) {
  if (!module.is_subscribed) return null;

  const hasUnmetDeps = module.unmet_dependencies.length > 0;
  const hasBlockingDeps = module.blocking_dependencies.length > 0;

  if (!module.is_active && hasUnmetDeps) {
    return {
      icon: Lock,
      title: "Não pode ser ativado",
      description: `Requer os módulos: ${module.unmet_dependencies.join(", ")}`,
      variant: "destructive" as const,
    };
  }

  if (module.is_active && hasBlockingDeps) {
    return {
      icon: Lock,
      title: "Não pode ser desativado",
      description: `É necessário para: ${module.blocking_dependencies.join(", ")}`,
      variant: "destructive" as const,
    };
  }

  return {
    icon: Unlock,
    title: module.is_active ? "Pode ser desativado" : "Pode ser ativado",
    description: "Clique no switch para alterar o estado",
    variant: "default" as const,
  };
}

export function ModuleCard({
  module,
  isToggling,
  onToggle,
  onRequest,
}: ModuleCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tooltipInfo = getToggleTooltip(module);
  const toggleEnabled = canToggle(module) && !isToggling;

  return (
    <Card
      ref={cardRef}
      variant="elevated"
      className={cn(getModuleStatusColor(module), isToggling && "opacity-60")}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            {getModuleStatusIcon(module)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight">
                {module.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {module.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {module.is_subscribed ? (
            <>
              <Badge
                variant={module.is_active ? "success" : "secondary"}
                className="text-xs"
              >
                {module.is_active ? "Ativo" : "Inativo"}
              </Badge>
              {module.unmet_dependencies.length > 0 && !module.is_active && (
                <Badge variant="error" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
              {module.blocking_dependencies.length > 0 && module.is_active && (
                <Badge variant="info" className="text-xs">
                  <Link2 className="h-3 w-3 mr-1" />
                  Em uso
                </Badge>
              )}
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              Não contratado
            </Badge>
          )}
        </div>

        {/* Dependencies Info */}
        {module.is_subscribed &&
          (module.unmet_dependencies.length > 0 ||
            module.blocking_dependencies.length > 0) && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-md text-xs">
              {module.unmet_dependencies.length > 0 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 mt-0.5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">
                      Dependências não atendidas:
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      {module.unmet_dependencies.join(", ")}
                    </p>
                  </div>
                </div>
              )}
              {module.blocking_dependencies.length > 0 && (
                <div className="flex items-start gap-2">
                  <Link2 className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary">Requerido por:</p>
                    <p className="text-muted-foreground mt-0.5">
                      {module.blocking_dependencies.join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Action Controls */}
        {module.is_subscribed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                  <div className="flex items-center gap-2">
                    {tooltipInfo && (
                      <tooltipInfo.icon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {module.is_active ? "Desativar módulo" : "Ativar módulo"}
                    </span>
                  </div>
                  <Switch
                    checked={module.is_active}
                    disabled={!toggleEnabled}
                    onCheckedChange={() =>
                      onToggle(module.module_key, module.is_active)
                    }
                  />
                </div>
              </TooltipTrigger>
              {tooltipInfo && (
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{tooltipInfo.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {tooltipInfo.description}
                    </p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button type="button"
            variant="outline"
            className="w-full"
            onClick={() => onRequest(module.module_key, module.name)}
          >
            <Info className="h-4 w-4 mr-2" />
            Solicitar Contratação
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
