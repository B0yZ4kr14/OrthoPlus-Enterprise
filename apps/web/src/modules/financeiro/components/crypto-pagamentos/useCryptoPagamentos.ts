// cspell:disable
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCrypto } from "@/modules/crypto/hooks/useCrypto";
import { useCryptoNotifications } from "@/hooks/useCryptoNotifications";
import { useCryptoPriceAlerts } from "@/modules/crypto/hooks/useCryptoPriceAlerts";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type { CryptoWallet, ExchangeConfig } from "@/modules/crypto/types/crypto.types";
import type { PriceAlert } from "@/modules/crypto/hooks/useCryptoPriceAlerts";

export function useCryptoPagamentos() {
  const { clinicId } = useAuth();
  const { connected: notificationsConnected, requestNotificationPermission } = useCryptoNotifications();

  const {
    exchanges,
    wallets,
    transactions,
    loading,
    syncWalletBalance,
    convertCryptoToBRL,
    getDashboardData,
    createExchangeConfig,
    createWallet,
    createPaymentRequest,
  } = useCrypto(clinicId || "");

  const {
    alerts,
    loading: alertsLoading,
    createAlert,
    toggleAlert,
    deleteAlert,
  } = useCryptoPriceAlerts();

  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [syncingWallet, setSyncingWallet] = useState<string | null>(null);
  const [convertingTx, setConvertingTx] = useState<string | null>(null);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [cascadeWizardOpen, setCascadeWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  const dashboardData = getDashboardData();

  const handleSyncWallet = useCallback(async (walletId: string) => {
    setSyncingWallet(walletId);
    try {
      await syncWalletBalance(walletId);
    } finally {
      setSyncingWallet(null);
    }
  }, [syncWalletBalance]);

  const handleConvert = useCallback(async (transactionId: string) => {
    setConvertingTx(transactionId);
    try {
      await convertCryptoToBRL(transactionId);
    } finally {
      setConvertingTx(null);
    }
  }, [convertCryptoToBRL]);

  const handleExchangeSubmit = useCallback(async (data: Partial<ExchangeConfig>) => {
    await createExchangeConfig(data);
    setExchangeDialogOpen(false);
  }, [createExchangeConfig]);

  const handleWalletSubmit = useCallback(async (data: Partial<CryptoWallet>) => {
    await createWallet(data);
    setWalletDialogOpen(false);
  }, [createWallet]);

  const handleAlertSubmit = useCallback(async (data: Omit<PriceAlert, "id" | "created_at" | "last_triggered_at" | "is_active">) => {
    await createAlert(data);
    setAlertDialogOpen(false);
  }, [createAlert]);

  const handleCascadeSubmit = useCallback(async (cascadeAlerts: Omit<PriceAlert, "id" | "created_at" | "last_triggered_at" | "is_active">[]) => {
    try {
      for (const alertData of cascadeAlerts) {
        await createAlert(alertData);
      }
      toast.success(`Estratégia DCA criada com ${cascadeAlerts.length} níveis!`);
      setCascadeWizardOpen(false);
    } catch (error) {
      logger.error("Error creating cascade:", error);
      toast.error("Erro ao criar estratégia em cascata");
    }
  }, [createAlert]);

  const openQrCode = useCallback((wallet: CryptoWallet) => {
    setSelectedWallet(wallet);
    setQrCodeDialogOpen(true);
  }, []);

  return {
    clinicId,
    notificationsConnected,
    requestNotificationPermission,
    exchanges,
    wallets,
    transactions,
    loading,
    dashboardData,
    alerts,
    alertsLoading,
    selectedWallet,
    syncingWallet,
    convertingTx,
    setConvertingTx,
    exchangeDialogOpen,
    setExchangeDialogOpen,
    walletDialogOpen,
    setWalletDialogOpen,
    qrCodeDialogOpen,
    setQrCodeDialogOpen,
    alertDialogOpen,
    setAlertDialogOpen,
    cascadeWizardOpen,
    setCascadeWizardOpen,
    activeTab,
    setActiveTab,
    handleSyncWallet,
    handleConvert,
    handleExchangeSubmit,
    handleWalletSubmit,
    handleAlertSubmit,
    handleCascadeSubmit,
    openQrCode,
    createPaymentRequest,
    convertCryptoToBRL,
    toggleAlert,
    deleteAlert,
  };
}
