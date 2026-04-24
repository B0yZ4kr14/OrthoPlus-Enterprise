import { useState, useCallback } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

export function useWalletQRPreview(wallet: CryptoWallet) {
  const [copied, setCopied] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(wallet.wallet_address);
      setCopied(true);
      toast.success("Endereço copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar endereço");
    }
  }, [wallet.wallet_address]);

  const handleShowQRCode = useCallback(async () => {
    try {
      const url = await QRCode.toDataURL(wallet.wallet_address, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrCodeUrl(url);
      setQrDialogOpen(true);
    } catch {
      toast.error("Erro ao gerar QR Code");
    }
  }, [wallet.wallet_address]);

  return {
    copied,
    qrDialogOpen,
    qrCodeUrl,
    setQrDialogOpen,
    handleCopyAddress,
    handleShowQRCode,
  };
}
