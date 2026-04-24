import type { ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI. Defaults to a styled error card. */
  fallback?: ReactNode;
  /** Module name for error reporting context */
  moduleName?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorFallbackProps {
  moduleName?: string;
  error: Error | null;
  onRetry: () => void;
}
