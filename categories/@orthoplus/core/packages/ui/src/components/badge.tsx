import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "text-foreground border-border bg-background hover:bg-muted",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400",
        error:
          "border-transparent bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:text-red-400",
        info:
          "border-transparent bg-sky-500/15 text-sky-700 hover:bg-sky-500/25 dark:text-sky-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const dotColors: Record<string, string> = {
    default: "bg-primary",
    secondary: "bg-secondary",
    destructive: "bg-destructive",
    outline: "bg-foreground",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-sky-500",
  };

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
            dotColors[variant || "default"],
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
