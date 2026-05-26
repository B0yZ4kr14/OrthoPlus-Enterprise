import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { CategoryBackupStatus, BackupExecutionResult } from "@orthoplus/shared-types";

export function useBackupStatus() {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const statusQuery = useQuery<{ categories: CategoryBackupStatus[] }>({
    queryKey: ["backup-status", clinicId],
    queryFn: async () => {
      const res = await apiClient.get<{ categories: CategoryBackupStatus[] }>(
        "/database_admin/master/backups"
      );
      return res;
    },
    enabled: !!clinicId,
    refetchInterval: 30000,
  });

  const executeBackup = useMutation({
    mutationFn: async (category: string) => {
      const res = await apiClient.post<BackupExecutionResult>(
        `/database_admin/master/backup/${category}`,
        { compress: true }
      );
      return res;
    },
    onSuccess: (data) => {
      toast.success(`Backup ${data.category} concluído`, {
        description: `Tamanho: ${data.sizeHuman} em ${data.durationMs}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ["backup-status", clinicId] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao executar backup", { description: error.message });
    },
  });

  return {
    categories: statusQuery.data?.categories ?? [],
    isLoading: statusQuery.isLoading,
    executeBackup: executeBackup.mutate,
    isExecuting: executeBackup.isPending,
  };
}
