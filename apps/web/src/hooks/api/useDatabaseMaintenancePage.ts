import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

interface DBStats {
  id?: string;
  clinicId?: string;
  connectionPoolSize?: number;
  activeConnections?: number;
  idleConnections?: number;
  slowQueriesCount?: number;
  averageQueryTime?: number;
  diskUsagePercent?: number;
  lastVacuum?: string;
  lastAnalyze?: string;
  timestamp?: string;
  tables?: Array<{
    name: string;
    rows: number;
    size: string;
    last_vacuum: string;
  }>;
}

import { useState } from "react";

export const useDatabaseMaintenancePage = () => {
  const queryClient = useQueryClient();
  const [executingOperation, setExecutingOperation] = useState<string | null>(
    null,
  );

  const { data: stats, isLoading } = useQuery<DBStats>({
    queryKey: ["database-maintenance-page"],
    queryFn: async () => {
      const data = await apiClient.get<{ health: DBStats }>("/db/health");
      return { ...data.health, tables: data.health.tables || [] };
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: async (payload: {
      operation: string;
      targetSchema?: string;
    }) => {
      setExecutingOperation(payload.operation);
      return await apiClient.post<{ message: string }>(
        "/db/maintenance",
        payload,
      );
    },
    onSettled: () => {
      setExecutingOperation(null);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["database-maintenance-page"],
      });
    },
    onError: () => {
      toast.error("Erro ao executar manutenção");
    },
  });

  return {
    stats,
    isLoading,
    executeMaintenance: maintenanceMutation.mutate,
    isExecuting: executingOperation,
  };
};
