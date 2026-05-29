import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import type { BackupEntry, IntegrityResult } from "./types";

export function useIntegrityChecker() {
  const [loading, setLoading] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string>("");
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [backups, setBackups] = useState<BackupEntry[]>([]);

  const loadBackups = useCallback(async () => {
    try {
      const data = await apiClient.get<BackupEntry[]>(
        "/configuracoes/backups/historico",
        { params: { status: "success", limit: 20 } },
      );
      if (data) setBackups(data);
    } catch (e) {
      logger.error("Failed to load backups", e);
    }
  }, []);

  const checkIntegrity = useCallback(async () => {
    if (!selectedBackupId) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await apiClient.post<IntegrityResult>("/backups/manager", {
        backupId: selectedBackupId,
      });

      setResult(data);

      if (data.isValid) {
        toast.success("Backup íntegro!", {
          description: "Nenhuma corrupção detectada",
        });
      } else {
        toast.error("Backup corrompido!", {
          description: "Foram detectadas inconsistências nos checksums",
        });
      }
    } catch (error) {
      logger.error("Error:", error);
      toast.error("Erro ao validar backup");
    } finally {
      setLoading(false);
    }
  }, [selectedBackupId]);

  return {
    loading,
    selectedBackupId,
    result,
    backups,
    setSelectedBackupId,
    loadBackups,
    checkIntegrity,
  };
}
