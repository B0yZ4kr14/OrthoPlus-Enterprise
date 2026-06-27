import * as React from "react";
import { cn } from "../lib/utils";
import { Switch } from "./switch";

export interface ModuleCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  enabled?: boolean;
  disabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export function ModuleCard({
  title,
  description,
  icon,
  enabled = false,
  disabled = false,
  onToggle,
  className,
}: ModuleCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm transition-colors",
        enabled ? "bg-card" : "bg-muted/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {icon && <div className="text-primary shrink-0">{icon}</div>}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
        {onToggle && (
          <Switch
            checked={enabled}
            disabled={disabled}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${title}`}
          />
        )}
      </div>
    </div>
  );
}

ModuleCard.displayName = "ModuleCard";
