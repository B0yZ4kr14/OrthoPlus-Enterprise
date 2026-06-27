import { useState, useCallback } from "react";
import type { BackupType, DataCategory, BackupConfig } from "./types";

const INITIAL_CONFIG: BackupConfig = {
  type: "full",
  selectedData: ["patients", "appointments", "records"],
  compression: true,
  encryption: true,
};

export function useBackupWizard(onClose: () => void) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BackupConfig>(INITIAL_CONFIG);

  const setBackupType = useCallback((type: BackupType) => {
    setConfig((prev) => ({ ...prev, type }));
  }, []);

  const toggleDataCategory = useCallback((category: DataCategory) => {
    setConfig((prev) => ({
      ...prev,
      selectedData: prev.selectedData.includes(category)
        ? prev.selectedData.filter((id) => id !== category)
        : [...prev.selectedData, category],
    }));
  }, []);

  const setCompression = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, compression: enabled }));
  }, []);

  const setEncryption = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, encryption: enabled }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const confirm = useCallback(() => {
    // Implementar lógica de backup
    onClose();
    setStep(1);
    setConfig(INITIAL_CONFIG);
  }, [onClose]);

  const reset = useCallback(() => {
    setStep(1);
    setConfig(INITIAL_CONFIG);
  }, []);

  return {
    step,
    config,
    setBackupType,
    toggleDataCategory,
    setCompression,
    setEncryption,
    nextStep,
    prevStep,
    confirm,
    reset,
  };
}
