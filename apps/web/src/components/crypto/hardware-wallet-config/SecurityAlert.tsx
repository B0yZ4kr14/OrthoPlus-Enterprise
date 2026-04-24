import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Shield, ExternalLink } from "lucide-react";

interface SecurityAlertProps {
  variant?: "info" | "psbt";
}

export function SecurityAlert({ variant = "info" }: SecurityAlertProps) {
  if (variant === "psbt") {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Segurança Máxima:</strong> As transações devem ser assinadas
          offline no dispositivo hardware. O sistema gerará PSBTs (Partially
          Signed Bitcoin Transactions) que você pode assinar via QR Code ou
          cartão SD, mantendo suas chaves privadas sempre offline.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        Carteiras Offline (Air-Gapped) fornecem máxima segurança mantendo suas
        chaves privadas completamente isoladas da internet. Recomendamos{" "}
        <a
          href="https://dseclab.io/br/products/coldkitx?campaign_id=120231315734340647&ad_id=120231315973490647"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          COLDMULTI/KRUX
          <ExternalLink className="h-3 w-3" />
        </a>{" "}
        para configuração 100% offline e open-source.
      </AlertDescription>
    </Alert>
  );
}
