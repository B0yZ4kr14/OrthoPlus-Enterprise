// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getStatusColor } from "./StatusIcon";
import type { TestResult } from "./types";

interface TestResultViewProps {
  testResult: TestResult;
}

export function TestResultView({ testResult }: TestResultViewProps) {
  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(testResult)}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Resultado do Teste</h3>
          <Badge variant={testResult.success ? "success" : "destructive"}>
            {testResult.success ? "Aprovado" : "Reprovado"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded">
            <p className="text-2xl font-bold">{testResult.testsRun}</p>
            <p className="text-xs text-muted-foreground">Testes Executados</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded">
            <p className="text-2xl font-bold text-success">{testResult.testsPassed}</p>
            <p className="text-xs text-muted-foreground">Aprovados</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded">
            <p className="text-2xl font-bold text-destructive">{testResult.testsFailed}</p>
            <p className="text-xs text-muted-foreground">Reprovados</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Duração: {(testResult.duration / 1000).toFixed(2)}s
        </div>

        {testResult.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Erros encontrados:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {testResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {testResult.success && (
          <Alert className="bg-success/10 border-success/20">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success dark:text-success">
              ✓ Backup validado com sucesso! Todos os testes passaram e o backup está pronto para ser restaurado caso necessário.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
