import { LucideIcon, Inbox, Search, AlertCircle, FileX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@orthoplus/core-ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "search" | "error" | "no-data";
  className?: string;
}

const variantConfig = {
  default: {
    icon: Inbox,
    iconColor: "text-muted-foreground",
  },
  search: {
    icon: Search,
    iconColor: "text-muted-foreground",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-destructive",
  },
  "no-data": {
    icon: FileX,
    iconColor: "text-muted-foreground",
  },
};

export function EmptyState({
  icon: CustomIcon,
  message,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 glass-card rounded-2xl m-4",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 p-4 rounded-2xl bg-muted/80 shadow-inner",
          config.iconColor,
        )}
      >
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1.5">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button type="button"
          onClick={action.onClick}
          size="sm"
          className="rounded-full px-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
