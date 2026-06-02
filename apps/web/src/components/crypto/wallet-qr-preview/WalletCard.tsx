import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Copy, Check, QrCode } from "lucide-react";
import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

interface WalletCardProps {
  wallet: CryptoWallet;
  copied: boolean;
  onCopy: () => void;
  onShowQR: () => void;
}

export function WalletCard({
  wallet,
  copied,
  onCopy,
  onShowQR,
}: WalletCardProps) {
  return (
    <Card depth="normal" className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {wallet.wallet_name}
            <Badge variant="outline">{wallet.coin_type}</Badge>
          </CardTitle>
          <Badge variant="success">Ativa</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            Endereço da Carteira
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <code className="text-xs flex-1 break-all">
              {wallet.wallet_address}
            </code>
            <Button type="button"
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Saldo Atual</p>
            <p className="text-lg font-bold">
              {wallet.balance.toFixed(8)} {wallet.coin_type}
            </p>
          </div>
          <Button type="button"
            variant="outline"
            size="sm"
            onClick={onShowQR}
            className="gap-2"
          >
            <QrCode className="h-4 w-4" />
            Ver QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
