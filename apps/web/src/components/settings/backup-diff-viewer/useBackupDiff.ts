// cspell:disable
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type { DiffSummary, DiffResult } from "./types";

export function useBackupDiff(open: boolean) {
  const [backup1, setBackup1] = useState<string>("");
  const [backup2, setBackup2] = useState<string>("");
  const [diffResult, setDiffResult] = useState<DiffSummary | null>(null);

  const { data: backups } = useQuery({
    queryKey: ["backup-history-for-diff"],
    queryFn: async () => {
      const data = await apiClient.get<Record<string, any>[]>(
        "/backup_history?status=eq.success&order=created_at.desc&limit=50"
      );
      return data;
    },
    enabled: open,
  });

  const compareArrays = (arr1: unknown[], arr2: unknown[]): DiffResult => {
    const map1 = new Map((arr1 as Record<string, unknown>[]).map((item) => [item.id, item]));
    const map2 = new Map((arr2 as Record<string, unknown>[]).map((item) => [item.id, item]));

    const added = (arr2 as Record<string, unknown>[]).filter((item) => !map1.has(item.id));
    const removed = (arr1 as Record<string, unknown>[]).filter((item) => !map2.has(item.id));
    const modified = (arr2 as Record<string, unknown>[]).filter((item) => {
      if (!map1.has(item.id)) return false;
      const original = map1.get(item.id);
      return JSON.stringify(original) !== JSON.stringify(item);
    });

    return { added, modified, removed };
  };

  const compareMutation = async () => {
    if (!backup1 || !backup2) return;

    try {
      const data1 = await apiClient.post<unknown>("/backups/manager", { backup_id: backup1 });
      const data2 = await apiClient.post<unknown>("/backups/manager", { backup_id: backup2 });

      const backup1Data = JSON.parse((data1 as Record<string, string>).data);
      const backup2Data = JSON.parse((data2 as Record<string, string>).data);

      const diff: DiffSummary = {
        patients: compareArrays(backup1Data.patients || [], backup2Data.patients || []),
        appointments: compareArrays(backup1Data.appointments || [], backup2Data.appointments || []),
        clinical_history: compareArrays(backup1Data.clinical_history || [], backup2Data.clinical_history || []),
        financial: compareArrays(backup1Data.financial || [], backup2Data.financial || []),
      };

      setDiffResult(diff);
    } catch (error) {
      logger.error("Erro ao comparar backups:", error);
    }
  };

  const getTotalChanges = (diff: DiffResult) => diff.added.length + diff.modified.length + diff.removed.length;

  return {
    backup1,
    backup2,
    backups,
    diffResult,
    setBackup1,
    setBackup2,
    compareMutation,
    getTotalChanges,
  };
}
