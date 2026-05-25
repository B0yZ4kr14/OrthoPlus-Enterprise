import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface Backup {
  id: string;
  backup_type: string;
  status: string;
  file_size_bytes: number;
  created_at: string;
  completed_at: string | null;
}

export const useBackupsPage = () => {
  const queryClient = useQueryClient();

  const {
    data: backups = [],
    isLoading,
  } = useQuery({
    queryKey: ["backups-page"],
    queryFn: async () => {
      return await apiClient.get<Backup[]>("/backups");
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post("/backups/create", { backup_type: "full" });
    },
    onSuccess: () => {
      toast.success("Backup iniciado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["backups-page"] });
    },
    onError: () => {
      toast.error("Erro ao criar backup");
    },
  });

  return {
    backups,
    isLoading,
    createBackup: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};
