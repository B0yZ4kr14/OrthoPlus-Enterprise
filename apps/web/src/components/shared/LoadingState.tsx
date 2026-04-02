import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@orthoplus/core-ui/skeleton";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "skeleton" | "table" | "grid" | "list";
  message?: string;
  className?: string;
  rows?: number;
  columns?: number;
}

export function LoadingState({
  size = "md",
  variant = "spinner",
  message,
  className,
  rows = 5,
  columns = 4,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Table header skeleton */}
        <div className="flex gap-4 pb-3 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* Table rows skeleton */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
          className,
        )}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-8",
          className,
        )}
      >
        <div
          className={cn(
            "bg-primary/20 rounded-full animate-pulse",
            sizeClasses[size],
          )}
        />
        {message && (
          <p className="text-sm text-muted-foreground mt-4">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8",
        className,
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground mt-4">{message}</p>
      )}
    </div>
  );
}
