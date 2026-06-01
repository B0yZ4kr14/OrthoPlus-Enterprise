import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { QrCode, Copy, Check } from "lucide-react";
import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

interface QRCodeDialogProps {
  wallet: CryptoWallet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeUrl: string;
  copied: boolean;
  onCopy: () => void;
}

export function QRCodeDialog({
  wallet,
  open,
  onOpenChange,
  qrCodeUrl,
  copied,
  onCopy,
}: QRCodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code - {wallet.wallet_name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center p-6 bg-background rounded-lg">
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
              <Button type="button" variant="ghost" size="sm" onClick={onCopy}>
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
  );
}
