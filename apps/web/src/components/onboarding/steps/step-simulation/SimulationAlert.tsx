import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { PlayCircle } from "lucide-react";

export function SimulationAlert() {
  return (
    <Alert>
      <PlayCircle className="h-4 w-4" />
      <AlertDescription>
        Esta é uma simulação interativa. Tente ativar e desativar módulos para
        ver como o sistema valida as dependências em tempo real.
      </AlertDescription>
    </Alert>
  );
}
