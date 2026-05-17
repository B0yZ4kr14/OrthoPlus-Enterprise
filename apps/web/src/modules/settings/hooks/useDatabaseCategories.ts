import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export interface CategoryConfig {
  name: string;
  schemas: string[];
  description: string;
  modules: string[];
}

export interface CategoryHealth {
  category: string;
  status: "healthy" | "degraded" | "down";
  schemas: string[];
  schemasFound: string[];
  latencyMs: number;
}

export interface MasterHealthResult {
  overallStatus: "healthy" | "degraded" | "down";
  categories: CategoryHealth[];
  totalLatencyMs: number;
  checkedAt: string;
}

export interface CategoryStats {
  category: string;
  schemas: string[];
  tableCount: number;
  sizeBytes: number;
  sizeHuman: string;
  lastBackup: string | null;
}

export interface MasterStatsResult {
  totalCategories: number;
  totalSchemas: number;
  totalTables: number;
  totalSizeBytes: number;
  totalSizeHuman: string;
  categories: CategoryStats[];
  checkedAt: string;
}

export function useDatabaseCategories() {
  const { clinicId } = useAuth();

  const categoriesQuery = useQuery<{ categories: CategoryConfig[] }>({
    queryKey: ["database-categories", clinicId],
    queryFn: async () => {
      const res = await apiClient.get<{ categories: CategoryConfig[] }>(
        "/database_admin/categories"
      );
      return res;
    },
    enabled: !!clinicId,
  });

  const masterHealthQuery = useQuery<MasterHealthResult>({
    queryKey: ["database-master-health", clinicId],
    queryFn: async () => {
      const res = await apiClient.get<MasterHealthResult>(
        "/database_admin/master/health"
      );
      return res;
    },
    enabled: !!clinicId,
    refetchInterval: 30000, // Refresh a cada 30s
  });

  const masterStatsQuery = useQuery<MasterStatsResult>({
    queryKey: ["database-master-stats", clinicId],
    queryFn: async () => {
      const res = await apiClient.get<MasterStatsResult>(
        "/database_admin/master/stats"
      );
      return res;
    },
    enabled: !!clinicId,
    refetchInterval: 60000, // Refresh a cada 60s
  });

  return {
    categories: categoriesQuery.data?.categories ?? [],
    isLoadingCategories: categoriesQuery.isLoading,
    masterHealth: masterHealthQuery.data,
    isLoadingHealth: masterHealthQuery.isLoading,
    masterStats: masterStatsQuery.data,
    isLoadingStats: masterStatsQuery.isLoading,
  };
}
