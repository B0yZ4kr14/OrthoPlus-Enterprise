/* eslint-disable */
import { logger } from "@/lib/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "./types";
import { ErrorFallback } from "./components/ErrorFallback";

export * from "./types";
export { ErrorFallback };

/**
 * React Error Boundary for catching render errors in subtrees.
 * Prevents a single module crash from taking down the entire app.
 *
 * Usage:
 *   <ErrorBoundary moduleName="financeiro">
 *     <FinanceiroRoutes />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Production-safe logging — avoid console.log
    if (import.meta.env.DEV) {
      console.error(
        `[ErrorBoundary${this.props.moduleName ? `:${this.props.moduleName}` : ""}]`,
        error,
        errorInfo
      );
    }

    logger.error("ErrorBoundary caught error:", { error, errorInfo, moduleName: this.props.moduleName });

    // TODO: Send to error reporting service (e.g., Sentry)
    // reportError({ error, errorInfo, moduleName: this.props.moduleName });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          moduleName={this.props.moduleName}
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
