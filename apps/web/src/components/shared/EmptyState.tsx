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
        "flex flex-col items-center justify-center py-12 px-4",
        className,
      )}
    >
      <div className={cn("mb-4 p-4 rounded-full bg-muted", config.iconColor)}>
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{message}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
