import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { HealthMetrics } from "../types";

interface HealthResponse {
  totalDocuments: number;
  coveragePercent: number;
  driftCount: number;
  lastScan: string;
}

export function useMemoryHubHealth() {
  const query = useQuery<HealthMetrics, Error>({
    queryKey: ["memory-hub", "health"],
    queryFn: async () => {
      const data = await apiClient.get<HealthResponse>("/memory-hub/health");
      return {
        totalDocuments: data.totalDocuments || 0,
        coveragePercent: data.coveragePercent || 0,
        driftCount: data.driftCount || 0,
        lastScan: data.lastScan || new Date().toISOString(),
      };
    },
    staleTime: 1000 * 60, // 1 minuto
  });

  return {
    metrics: query.data || null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refresh: async () => {
      await query.refetch();
    },
  };
}
