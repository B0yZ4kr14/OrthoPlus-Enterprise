import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { AlertCircle } from "lucide-react";

export function DependencyAlert() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Alguns módulos dependem de outros para funcionar corretamente. O sistema
        não permitirá que você desative um módulo se outro módulo ativo depende
        dele.
      </AlertDescription>
    </Alert>
  );
}
