import { useState, useEffect } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import type { BackupData, RestoreResults, SelectedItems } from "./types";
import { DEFAULT_SELECTED_ITEMS } from "./types";

interface UseBackupRestoreReturn {
  step: number;
  loading: boolean;
  backupData: BackupData | null;
  decryptionPassword: string;
  requiresDecryption: boolean;
  progress: number;
  selectedItems: SelectedItems;
  results: RestoreResults | null;
  error: string | null;
  setStep: (step: number) => void;
  setDecryptionPassword: (password: string) => void;
  setSelectedItems: (items: SelectedItems) => void;
  toggleItem: (key: keyof SelectedItems) => void;
  handleValidateBackup: (backupFile: File) => Promise<void>;
  handleRestore: () => Promise<void>;
  handleClose: () => void;
}

export function useBackupRestore(
  open: boolean,
  onClose: () => void,
  backupFile?: File
): UseBackupRestoreReturn {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [decryptionPassword, setDecryptionPassword] = useState("");
  const [requiresDecryption, setRequiresDecryption] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedItems, setSelectedItems] = useState<SelectedItems>(DEFAULT_SELECTED_ITEMS);
  const [results, setResults] = useState<RestoreResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && backupFile) {
      handleValidateBackup(backupFile);
    }
  }, [open, backupFile]);

  const handleValidateBackup = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("backup", file);

      const response = await apiClient.post<BackupData>("/backup/validate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.requiresDecryption) {
        setRequiresDecryption(true);
        setStep(1);
      } else {
        setBackupData(response);
        setStep(2);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao validar backup";
      setError(message);
      logger.error("Backup validation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!backupFile) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("backup", backupFile);
      formData.append("password", decryptionPassword);

      const response = await apiClient.post<BackupData>("/backup/decrypt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setBackupData(response);
      setRequiresDecryption(false);
      setStep(2);
    } catch (err) {
      toast.error("Senha de descriptografia incorreta");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!backupData) return;
    
    setLoading(true);
    setStep(4);
    setProgress(0);

    try {
      const response = await apiClient.post<RestoreResults>("/backup/restore", {
        backupId: backupData.backupId,
        selectedItems,
      });

      // Simular progresso
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      setTimeout(() => {
        setResults(response);
        clearInterval(interval);
        setProgress(100);
      }, 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro na restauração";
      setError(message);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key: keyof SelectedItems) => {
    setSelectedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClose = () => {
    setStep(1);
    setBackupData(null);
    setDecryptionPassword("");
    setRequiresDecryption(false);
    setProgress(0);
    setSelectedItems(DEFAULT_SELECTED_ITEMS);
    setResults(null);
    setError(null);
    onClose();
  };

  return {
    step,
    loading,
    backupData,
    decryptionPassword,
    requiresDecryption,
    progress,
    selectedItems,
    results,
    error,
    setStep,
    setDecryptionPassword,
    setSelectedItems,
    toggleItem,
    handleValidateBackup,
    handleRestore,
    handleClose,
  };
}
