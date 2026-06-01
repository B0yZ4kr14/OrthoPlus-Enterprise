import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI. Defaults to a styled error card. */
  fallback?: ReactNode;
  /** Module name for error reporting context */
  moduleName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

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
    console.error(
      `[ErrorBoundary${this.props.moduleName ? `:${this.props.moduleName}` : ""}]`,
      error,
      errorInfo,
    );
    // Error already logged above. Integrate Sentry/Datadog here when needed.
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
        <div className="flex items-center justify-center min-h-[300px] p-8">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center space-y-4 shadow-[var(--shadow-card)]">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Algo deu errado
              </h3>
              <p className="text-sm text-muted-foreground">
                {this.props.moduleName
                  ? `O módulo "${this.props.moduleName}" encontrou um erro inesperado.`
                  : "Ocorreu um erro inesperado nesta seção."}
              </p>
            </div>

            {this.state.error && (
              <details className="text-left" open>
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs text-destructive overflow-auto max-h-32">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack?.split("\n").slice(0, 5).join("\n")}
                </pre>
              </details>
            )}

            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-interactive hover:bg-interactive/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
