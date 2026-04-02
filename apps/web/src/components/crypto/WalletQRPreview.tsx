import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Copy, Check, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";

interface WalletQRPreviewProps {
  wallet: {
    id: string;
    wallet_name: string;
    wallet_address: string;
    coin_type: string;
    balance: number;
    is_active: boolean;
  };
}

export function WalletQRPreview({ wallet }: WalletQRPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.wallet_address);
      setCopied(true);
      toast.success("Endereço copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar endereço");
    }
  };

  const handleShowQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(wallet.wallet_address, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
      setQrDialogOpen(true);
    } catch (error) {
      toast.error("Erro ao gerar QR Code");
    }
  };

  if (!wallet.is_active) return null;

  return (
    <>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowQRCode}
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              Ver QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code - {wallet.wallet_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Endereço:</p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="text-xs flex-1 break-all">
                  {wallet.wallet_address}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Compartilhe este QR Code para receber pagamentos em{" "}
              {wallet.coin_type}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
