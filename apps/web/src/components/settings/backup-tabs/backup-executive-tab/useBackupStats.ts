import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import type { BackupStats, TrendDataPoint } from "./types";

interface BackupRecord {
  created_at: string;
  status: string;
  file_size_bytes?: number;
}

export function useBackupStats() {
  const { clinicId } = useAuth();

  return useQuery<BackupStats>({
    queryKey: ["backup-executive-stats", clinicId],
    queryFn: async () => {
      const backups = await apiClient.get<BackupRecord[]>("/configuracoes/backups/historico", {
        params: { limit: 100 },
      });

      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recent = backups.filter((b) => new Date(b.created_at) >= last30Days);

      const totalBackups = recent.length;
      const successfulBackups = recent.filter((b) => b.status === "success").length;
      const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;

      const totalSize = recent.reduce((sum, b) => sum + (b.file_size_bytes || 0), 0);
      const avgSize = totalBackups > 0 ? totalSize / totalBackups : 0;

      const trendData: TrendDataPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const dayBackups = recent.filter((b) => b.created_at.split("T")[0] === dateStr);
        const daySuccess = dayBackups.filter((b) => b.status === "success").length;
        const dayFailed = dayBackups.filter((b) => b.status === "failed").length;

        trendData.push({
          date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          success: daySuccess,
          failed: dayFailed,
        });
      }

      return {
        totalBackups,
        successfulBackups,
        successRate,
        avgSize,
        totalSize,
        trendData,
      };
    },
    enabled: !!clinicId,
  });
}
