import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { QrCode } from "lucide-react";

export function WorkflowAlert() {
  return (
    <Alert>
      <QrCode className="h-4 w-4" />
      <AlertDescription>
        <strong>Workflow:</strong> Gere PSBT → Assine no Krux → Escaneie
        transação assinada → Broadcast
      </AlertDescription>
    </Alert>
  );
}
