import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { RetentionConfig, CleanupResult } from "./types";

export function useRetention() {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();
  const [retentionDays, setRetentionDays] = useState(30);
  const [autoCleanup, setAutoCleanup] = useState(true);

  const { data: config } = useQuery({
    queryKey: ["backup-retention-config", clinicId],
    queryFn: async () => {
      const data = await apiClient.get<RetentionConfig[]>(
        "/configuracoes/backups/retencao",
      );
      const clinic = data?.[0] || {};
      setRetentionDays(clinic.backup_retention_days || 30);
      setAutoCleanup(clinic.auto_cleanup_enabled || false);
      return clinic;
    },
    enabled: !!clinicId,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch("/configuracoes/backups/retencao", {
        backup_retention_days: retentionDays,
        auto_cleanup_enabled: autoCleanup,
      });
    },
    onSuccess: () => {
      toast.success("Configuração atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["backup-retention-config"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar configuração");
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const data = await apiClient.post<CleanupResult[]>(
        "/configuracoes/backups/limpeza",
        {
          p_clinic_id: clinicId,
        },
      );
      return data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const result = data[0];
        toast.success(
          `${result.deleted_count} backups removidos (${(result.freed_bytes / 1024 / 1024 / 1024).toFixed(2)} GB liberados)`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ["backup-timeline"] });
    },
    onError: () => {
      toast.error("Erro ao executar limpeza");
    },
  });

  return {
    retentionDays,
    autoCleanup,
    setRetentionDays,
    setAutoCleanup,
    updateMutation,
    cleanupMutation,
  };
}
