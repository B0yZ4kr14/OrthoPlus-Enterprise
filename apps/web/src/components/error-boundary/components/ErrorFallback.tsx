import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ErrorFallbackProps } from "../types";

export function ErrorFallback({ moduleName, error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-8">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center space-y-4 shadow-[var(--shadow-card)]">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Algo deu errado</h3>
          <p className="text-sm text-muted-foreground">
            {moduleName
              ? `O módulo "${moduleName}" encontrou um erro inesperado.`
              : "Ocorreu um erro inesperado nesta seção."}
          </p>
        </div>

        {import.meta.env.DEV && error && (
          <details className="text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Detalhes do erro (dev only)
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs text-destructive overflow-auto max-h-32">
              {error.message}
              {"\n"}
              {error.stack?.split("\n").slice(0, 5).join("\n")}
            </pre>
          </details>
        )}

        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-interactive hover:bg-interactive/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
