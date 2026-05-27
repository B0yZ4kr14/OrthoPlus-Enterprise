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
      <Alert className="bg-success/10 border-success/20">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertDescription className="text-success dark:text-success">
          Conexão com a exchange testada com sucesso!
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert className="bg-destructive/10 border-destructive/20">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive dark:text-destructive">
          Falha ao conectar. Verifique se suas credenciais estão corretas.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
