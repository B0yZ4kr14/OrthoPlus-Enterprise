import { useState, useCallback } from "react";
import type {
  HardwareWallet,
  WalletFormData,
  HardwareWalletType,
} from "./types";

const INITIAL_FORM_DATA: WalletFormData = {
  name: "",
  type: "krux",
  xpub: "",
  fingerprint: "",
  multisig: false,
};

export function useHardwareWallets() {
  const [wallets, setWallets] = useState<HardwareWallet[]>([]);
  const [formData, setFormData] = useState<WalletFormData>(INITIAL_FORM_DATA);

  const updateField = useCallback(
    <K extends keyof WalletFormData>(field: K, value: WalletFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const addWallet = useCallback(() => {
    if (!formData.name || !formData.xpub) return false;

    const newWallet: HardwareWallet = {
      id: crypto.randomUUID(),
      ...formData,
      isActive: true,
    };

    setWallets((prev) => [...prev, newWallet]);
    setFormData(INITIAL_FORM_DATA);
    return true;
  }, [formData]);

  const removeWallet = useCallback((id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  return {
    wallets,
    formData,
    updateField,
    addWallet,
    removeWallet,
    resetForm,
  };
}
