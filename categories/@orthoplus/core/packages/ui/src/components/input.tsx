import * as React from "react";

import { cn } from "../lib/utils";

export interface InputProps
  extends React.ComponentProps<"input"> {
  state?: "default" | "error" | "success" | "warning";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = "default", ...props }, ref) => {
    const stateClasses = {
      default:
        "border-input focus-visible:ring-interactive focus-visible:border-interactive",
      error:
        "border-destructive/70 focus-visible:ring-destructive focus-visible:border-destructive bg-destructive/5",
      success:
        "border-emerald-500/70 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 bg-emerald-500/5",
      warning:
        "border-amber-500/70 focus-visible:ring-amber-500 focus-visible:border-amber-500 bg-amber-500/5",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-base ring-offset-background transition-colors duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          stateClasses[state],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
