import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ConfirmStepProps {
  backupDate: string;
}

export function ConfirmStep({ backupDate }: ConfirmStepProps) {
  return (
    <div className="space-y-4 py-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> Esta ação irá sobrescrever os dados atuais do sistema.
          Certifique-se de ter um backup recente antes de continuar.
        </AlertDescription>
      </Alert>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="h-5 w-5 text-destructive" />
          O que será restaurado?
        </div>
        <ul className="text-sm space-y-1 ml-7 text-muted-foreground">
          <li>• Todos os dados serão revertidos para {backupDate}</li>
          <li>• Alterações feitas após esta data serão perdidas</li>
          <li>• O processo pode levar alguns minutos</li>
          <li>• O sistema ficará temporariamente indisponível</li>
        </ul>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Recomendamos criar um backup dos dados atuais antes de prosseguir.
        </AlertDescription>
      </Alert>
    </div>
  );
}
