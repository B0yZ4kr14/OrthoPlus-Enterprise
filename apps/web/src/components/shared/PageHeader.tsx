import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconClassName = "",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3", className)}>
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div
            className={cn(
              "shrink-0 p-3 rounded-xl bg-interactive/10 border border-interactive/20 shadow-[0_0_12px_hsl(var(--interactive)/0.1)]",
              iconClassName
            )}
          >
            <Icon className="h-7 w-7 text-interactive" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display truncate">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 truncate">{description}</p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}