import { Button } from "@orthoplus/core-ui/button";
import { QrCode, Download } from "lucide-react";
import { QRCodeDisplay } from "../QRCodeDisplay";

interface ActionSectionProps {
  qrCodeUrl: string | null;
  bitcoinUri: string;
  amount: string;
  coinType?: string;
  isSubmitting: boolean;
  onDownload: () => void;
  onSubmit: () => void;
}

export function ActionSection({
  qrCodeUrl,
  bitcoinUri,
  amount,
  coinType,
  isSubmitting,
  onDownload,
  onSubmit,
}: ActionSectionProps) {
  if (!qrCodeUrl) return null;

  return (
    <div className="space-y-4">
      <QRCodeDisplay
        qrCodeUrl={qrCodeUrl}
        bitcoinUri={bitcoinUri}
        amount={amount}
        coinType={coinType}
        onDownload={onDownload}
      />

      <Button
        onClick={onSubmit}
        className="w-full"
        disabled={isSubmitting}
      >
        <QrCode className="h-4 w-4 mr-2" />
        {isSubmitting ? "Gerando..." : "Gerar Solicitação de Pagamento"}
      </Button>
    </div>
  );
}
