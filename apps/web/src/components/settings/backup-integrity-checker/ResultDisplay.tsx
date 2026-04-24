import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Badge } from "@orthoplus/core-ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { IntegrityResult } from "./types";

interface ResultDisplayProps {
  result: IntegrityResult;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <Alert variant={result.isValid ? "default" : "destructive"} className="mt-4">
      <div className="flex items-start gap-3">
        {result.isValid ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-destructive" />
        )}
        <div className="flex-1 space-y-3">
          <AlertDescription className="font-semibold">
            {result.isValid ? "✓ Backup íntegro" : "⚠ Backup corrompido"}
          </AlertDescription>

          <div className="grid gap-2 text-sm font-mono bg-muted p-3 rounded">
            <div className="flex justify-between">
              <span>MD5:</span>
              <Badge variant={result.isValid ? "success" : "destructive"}>
                {result.isValid ? "Match" : "Mismatch"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>SHA256:</span>
              <Badge variant={result.isValid ? "success" : "destructive"}>
                {result.isValid ? "Match" : "Mismatch"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Tamanho:</span>
              <span>{(result.fileSize / 1024).toFixed(2)} KB</span>
            </div>
            <div className="flex justify-between">
              <span>Data:</span>
              <span>{new Date(result.createdAt).toLocaleString("pt-BR")}</span>
            </div>
          </div>

          {!result.isValid && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Atenção:</strong> Este backup pode estar corrompido ou foi
                modificado. Recomenda-se não utilizá-lo para restauração.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Alert>
  );
}
