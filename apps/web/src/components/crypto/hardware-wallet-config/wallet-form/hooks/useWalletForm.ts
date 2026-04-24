import { useMemo, useCallback } from "react";
import type { WalletFormData } from "../types";

export function useWalletForm(formData: WalletFormData) {
  const canSubmit = useMemo(() => {
    return formData.name && formData.xpub;
  }, [formData.name, formData.xpub]);

  const handleUpdate = useCallback(
    <K extends keyof WalletFormData>(
      onUpdate: (field: K, value: WalletFormData[K]) => void
    ) => {
      return (field: K, value: WalletFormData[K]) => {
        onUpdate(field, value);
      };
    },
    []
  );

  return {
    canSubmit,
    handleUpdate,
  };
}
