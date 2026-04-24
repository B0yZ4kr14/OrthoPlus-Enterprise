import { Button } from "@orthoplus/core-ui/button";
import { Loader2, QrCode } from "lucide-react";

interface GenerateButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export function GenerateButton({ disabled, loading, onClick }: GenerateButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} className="w-full gap-2">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando endereço...
        </>
      ) : (
        <>
          <QrCode className="h-4 w-4" />
          Gerar QR Code de Pagamento
        </>
      )}
    </Button>
  );
}
