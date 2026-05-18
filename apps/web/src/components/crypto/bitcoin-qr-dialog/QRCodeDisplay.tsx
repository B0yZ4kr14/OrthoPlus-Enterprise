import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import { Label } from "@orthoplus/core-ui/label";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  bitcoinUri: string;
  amount: string;
  coinType?: string;
  onDownload: () => void;
}

export function QRCodeDisplay({
  qrCodeUrl,
  bitcoinUri,
  amount,
  coinType,
  onDownload,
}: QRCodeDisplayProps) {
  const handleCopyUri = () => {
    navigator.clipboard.writeText(bitcoinUri);
    toast.success("URI Bitcoin copiado!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center p-6 bg-muted rounded-lg">
        <img src={qrCodeUrl} alt="QR Code Bitcoin" className="rounded" />
      </div>

      <div className="space-y-2">
        <Label>URI Bitcoin (BIP21)</Label>
        <div className="flex gap-2">
          <Input
            value={bitcoinUri}
            readOnly
            className="font-mono text-xs"
          />
          <Button variant="outline" size="icon" onClick={handleCopyUri}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button variant="outline" onClick={onDownload} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Baixar QR Code
      </Button>

      <div className="text-xs text-muted-foreground text-center p-4 bg-muted/50 rounded">
        <p className="font-semibold mb-2">Instruções para o Paciente:</p>
        <p>1. Abra sua carteira Bitcoin (Binance, Coinbase, etc.)</p>
        <p>2. Escaneie o QR Code acima</p>
        <p>
          3. Confirme o valor de {amount} {coinType}
        </p>
        <p>4. Envie a transação</p>
        <p className="mt-2 text-warning">
          ⚠️ Aguarde 3 confirmações na blockchain para confirmação completa
        </p>
      </div>
    </div>
  );
}
