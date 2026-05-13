import { useState, useMemo, useCallback } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { useCrypto } from "@/hooks/useCrypto";
import type { PaymentData, CombinedWallet, CoinType } from "./types";

export function useCryptoPayment(
  amount: number,
  onPaymentConfirmed: (txHash: string, cryptoCurrency: string) => void,
) {
  const { wallets, offlineWallets, loading: loadingData } = useCrypto();
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [selectedCoin, setSelectedCoin] = useState<CoinType>("BTC");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [generatingAddress, setGeneratingAddress] = useState(false);

  const allWallets = useMemo<any[]>(
    () => [
      ...wallets.map((w) => ({ ...w, type: "exchange" as const, coin_type: w.coin_type as CoinType })),
      ...offlineWallets.map((w) => ({ ...w, type: "offline" as const, coin_type: (w as any).coin_type as CoinType })),
    ],
    [wallets, offlineWallets],
  );

  const generatePayment = useCallback(async () => {
    if (!selectedWallet) {
      toast.error("Selecione uma wallet");
      return;
    }

    setGeneratingAddress(true);
    try {
      const mockAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;
      const mockQrData = `bitcoin:${mockAddress}?amount=${amount}`;

      setPaymentData({
        address: mockAddress,
        qrData: mockQrData,
        amount,
        coin: selectedCoin,
      });

      setQrDialogOpen(true);
    } catch (error: unknown) {
      logger.error("Error generating payment address:", error);
      toast.error("Erro ao gerar endereço de pagamento");
    } finally {
      setGeneratingAddress(false);
    }
  }, [selectedWallet, amount, selectedCoin]);

  const handlePaymentGenerated = useCallback(() => {
    toast.success(
      "Pagamento em processamento. Aguardando confirmações blockchain...",
    );

    setTimeout(() => {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      onPaymentConfirmed(mockTxHash, selectedCoin);
      toast.success("Pagamento confirmado!");
    }, 3000);
  }, [selectedCoin, onPaymentConfirmed]);

  return {
    allWallets,
    selectedWallet,
    setSelectedWallet,
    selectedCoin,
    setSelectedCoin,
    paymentData,
    qrDialogOpen,
    setQrDialogOpen,
    generatingAddress,
    loadingData,
    generatePayment,
    handlePaymentGenerated,
  };
}
