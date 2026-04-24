import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { Button } from "@orthoplus/core-ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { AlertCircle, Copy, Check } from "lucide-react";

interface PSBTResultProps {
  psbtBase64: string;
  copied: boolean;
  onCopy: () => void;
}

export function PSBTResult({ psbtBase64, copied, onCopy }: PSBTResultProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Escaneie o QR Code com seu Krux/Jade ou copie o PSBT para assinar offline
        </AlertDescription>
      </Alert>

      <div className="flex justify-center p-4 bg-background rounded-lg">
        <QRCodeCanvas value={psbtBase64} size={256} />
      </div>

      <div className="space-y-2">
        <Label>PSBT Base64</Label>
        <Textarea value={psbtBase64} readOnly rows={4} className="font-mono text-xs" />
        <Button variant="outline" size="sm" onClick={onCopy} className="w-full">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copiar PSBT
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
