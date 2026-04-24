import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Button } from "@orthoplus/core-ui/button";
import { CheckCircle, Upload } from "lucide-react";

interface SignedViewProps {
  onBroadcast: () => void;
  onCancel: () => void;
}

export function SignedView({ onBroadcast, onCancel }: SignedViewProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          Transação assinada recebida e validada. Pronta para broadcast.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Button onClick={onBroadcast} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Fazer Broadcast da Transação
        </Button>
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
