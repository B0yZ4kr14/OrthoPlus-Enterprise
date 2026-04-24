import { useState, useCallback } from "react";
import type { BitcoinQRCodeDialogProps } from "./types";

export function useBitcoinQRDialog(
  wallets: BitcoinQRCodeDialogProps["wallets"],
  onOpenChange: (open: boolean) => void
) {
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const resetForm = useCallback(() => {
    setAmount("");
    setSelectedWallet("");
  }, []);

  const handleDownloadQR = useCallback((qrCodeUrl: string | null, amount: string, coinType?: string) => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `bitcoin-payment-${amount}-${coinType || "btc"}.png`;
      link.click();
    }
  }, []);

  return {
    selectedWallet,
    setSelectedWallet,
    amount,
    setAmount,
    resetForm,
    handleDownloadQR,
  };
}
