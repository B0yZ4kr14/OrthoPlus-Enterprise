import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";

export type CategoryDatabase =
  | "CORE"
  | "FINANCEIRO"
  | "OPERACIONAL"
  | "COMERCIAL"
  | "CLINICO"
  | "ADMINISTRATIVO";

export const CATEGORY_ENDPOINTS: Record<string, string> = {
  CORE: "/pacientes/db",
  FINANCEIRO: "/financeiro/db",
  OPERACIONAL: "/estoque/db",
  COMERCIAL: "/crm/db",
  CLINICO: "/teleodonto/db",
  ADMINISTRATIVO: "/configuracoes/db",
};

export type CategoryDatabaseHealth = {
  status: "healthy" | "degraded" | "down";
  schemas: string[];
  latencyMs: number;
} | null;

export type CategoryDatabaseStats = {
  tableCount: number;
  sizeBytes: number;
  sizeHuman: string;
  lastBackup: string | null;
} | null;

type CategoryDatabaseBackupResponse = {
  filePath: string;
  sizeBytes: number;
};

export function useCategoryDatabase(category: CategoryDatabase) {
  const base = CATEGORY_ENDPOINTS[category];

  const healthQuery = useQuery({
    queryKey: ["category-db", category, "health"],
    queryFn: async (): Promise<CategoryDatabaseHealth> => {
      const response = await apiClient.get<CategoryDatabaseHealth>(
        `${base}/health`,
      );

      return response ?? null;
    },
    staleTime: 30_000,
    enabled: Boolean(base),
  });

  const statsQuery = useQuery({
    queryKey: ["category-db", category, "stats"],
    queryFn: async (): Promise<CategoryDatabaseStats> => {
      const response = await apiClient.get<CategoryDatabaseStats>(
        `${base}/stats`,
      );

      return response ?? null;
    },
    staleTime: 30_000,
    enabled: Boolean(base),
  });

  const health = healthQuery.data ?? null;
  const stats = statsQuery.data ?? null;
  const isLoading = healthQuery.isLoading || statsQuery.isLoading;

  const triggerBackup = useCallback(async () => {
    const response = await apiClient.post<CategoryDatabaseBackupResponse>(
      `${base}/backup`,
    );

    return {
      filePath: response.filePath,
      sizeBytes: response.sizeBytes,
    };
  }, [base]);

  const runMaintenance = useCallback(async () => {
    await apiClient.post<void>(`${base}/maintenance`);
  }, [base]);

  return {
    health,
    stats,
    isLoading,
    triggerBackup,
    runMaintenance,
  };
}

export default useCategoryDatabase;
