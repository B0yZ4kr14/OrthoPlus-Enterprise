// cspell:disable
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import type { ConnectionStatus } from "./types";

interface ConnectionAlertProps {
  status: ConnectionStatus;
}

export function ConnectionAlert({ status }: ConnectionAlertProps) {
  if (status === "success") {
    return (
      <Alert className="bg-green-500/10 border-green-500/20">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-600 dark:text-green-400">
          Conexão com a exchange testada com sucesso!
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-600 dark:text-red-400">
          Falha ao conectar. Verifique se suas credenciais estão corretas.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
