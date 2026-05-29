import { useState, useCallback } from "react";
import type { BackupOption } from "./types";

const BACKUPS: BackupOption[] = [
  {
    id: "1",
    date: "15/11/2025 18:30",
    type: "Full",
    size: "2.3 GB",
    status: "success",
  },
  {
    id: "2",
    date: "15/11/2025 12:00",
    type: "Incremental",
    size: "156 MB",
    status: "success",
  },
  {
    id: "3",
    date: "14/11/2025 18:30",
    type: "Full",
    size: "2.2 GB",
    status: "success",
  },
];

export function useRestoreWizard(onClose: () => void) {
  const [step, setStep] = useState(1);
  const [selectedBackup, setSelectedBackup] = useState("");

  const selectedBackupData = BACKUPS.find((b) => b.id === selectedBackup);

  const nextStep = useCallback(() => {
    if (step < 3) setStep((prev) => prev + 1);
  }, [step]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep((prev) => prev - 1);
  }, []);

  const confirm = useCallback(() => {
    onClose();
    setStep(1);
    setSelectedBackup("");
  }, [onClose]);

  const reset = useCallback(() => {
    setStep(1);
    setSelectedBackup("");
  }, []);

  return {
    step,
    selectedBackup,
    selectedBackupData,
    backups: BACKUPS,
    setSelectedBackup,
    nextStep,
    prevStep,
    confirm,
    reset,
  };
}
