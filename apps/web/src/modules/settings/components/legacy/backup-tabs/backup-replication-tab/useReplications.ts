import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import type { ReplicationRecord, ReplicationStats } from "./types";

export function useReplications() {
  const { clinicId } = useAuth();

  const { data: replications, isLoading } = useQuery({
    queryKey: ["backup-replications", clinicId],
    queryFn: async () => {
      const data = await apiClient.get<ReplicationRecord[]>(
        "/configuracoes/backups/replicacoes",
        { params: { limit: 50 } },
      );
      return data;
    },
    enabled: !!clinicId,
  });

  const stats: ReplicationStats = {
    total: replications?.length || 0,
    completed:
      replications?.filter((r) => r.replication_status === "COMPLETED")
        .length || 0,
    failed:
      replications?.filter((r) => r.replication_status === "FAILED").length ||
      0,
    pending:
      replications?.filter((r) => r.replication_status === "PENDING").length ||
      0,
  };

  return { replications, stats, isLoading };
}
