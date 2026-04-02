import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";

export interface ToastEnhancedProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  description?: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    className:
      "border-l-4 border-l-success bg-success/10 text-success-foreground",
    iconColor: "text-success",
  },
  error: {
    icon: XCircle,
    className:
      "border-l-4 border-l-destructive bg-destructive/10 text-destructive-foreground",
    iconColor: "text-destructive",
  },
  warning: {
    icon: AlertCircle,
    className:
      "border-l-4 border-l-warning bg-warning/10 text-warning-foreground",
    iconColor: "text-warning",
  },
  info: {
    icon: Info,
    className:
      "border-l-4 border-l-primary bg-primary/10 text-primary-foreground",
    iconColor: "text-primary",
  },
};

export const ToastEnhanced = React.forwardRef<
  HTMLDivElement,
  ToastEnhancedProps
>(
  (
    {
      variant = "info",
      title,
      description,
      onClose,
      action,
      className,
      ...props
    },
    ref,
  ) => {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm animate-slide-in-right",
          "border border-border bg-card/95",
          config.className,
          className,
        )}
        {...props}
      >
        {/* Icon */}
        <div className={cn("flex-shrink-0 mt-0.5", config.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-foreground mb-1">
              {title}
            </p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="mt-2 h-8 text-xs"
            >
              {action.label}
            </Button>
          )}
        </div>

        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  },
);

ToastEnhanced.displayName = "ToastEnhanced";
