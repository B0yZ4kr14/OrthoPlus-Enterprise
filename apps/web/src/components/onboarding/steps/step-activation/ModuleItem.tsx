import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Switch } from "@orthoplus/core-ui/switch";
import type { Module } from "./types";

interface ModuleItemProps {
  module: Module;
  isActive: boolean;
  onToggle: (id: string) => void;
}

export function ModuleItem({ module, isActive, onToggle }: ModuleItemProps) {
  return (
    <Card
      className={`p-4 transition-all ${
        isActive ? "bg-card" : "bg-muted/30 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              isActive ? "bg-success" : "bg-gray-400"
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{module.name}</span>
              {module.essential && (
                <Badge variant="secondary" className="text-xs">
                  Essencial
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{module.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {isActive ? "Ativo" : "Inativo"}
          </span>
          <Switch
            checked={isActive}
            onCheckedChange={() => onToggle(module.id)}
            disabled={module.essential}
          />
        </div>
      </div>
    </Card>
  );
}
