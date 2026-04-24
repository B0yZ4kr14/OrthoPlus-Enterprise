import { useState, useEffect, useRef } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import QRCode from "qrcode";
import type { CryptoWallet } from "@/modules/crypto/types/crypto.types";

export function useQRCodeGeneration(
  selectedWallet: string,
  amount: string,
  wallets: CryptoWallet[],
) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [bitcoinUri, setBitcoinUri] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const wallet = wallets.find((w) => w.id === selectedWallet);

  useEffect(() => {
    if (!wallet || !amount || parseFloat(amount) <= 0) {
      setQrCodeUrl("");
      setBitcoinUri("");
      return;
    }

    const uri = `bitcoin:${wallet.wallet_address}?amount=${amount}&label=Clinica%20Odontologica`;
    setBitcoinUri(uri);

    let cancelled = false;
    QRCode.toDataURL(uri, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).then((url) => {
      if (!cancelled) setQrCodeUrl(url);
    }).catch((error) => {
      logger.error("Error generating QR code:", error);
      toast.error("Erro ao gerar QR Code");
    });

    return () => { cancelled = true; };
  }, [wallet, amount]);

  return {
    qrCodeUrl,
    bitcoinUri,
    canvasRef,
    wallet,
  };
}
