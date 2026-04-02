import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { Database, HardDrive, Clock, CheckCircle2 } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { useAuth } from "@/contexts/AuthContext";

export function BackupStatsTab() {
  const { clinicId } = useAuth();
  const [stats, setStats] = useState({
    totalBackups: 0,
    totalSize: 0,
    lastBackup: null as string | null,
    successRate: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [clinicId]);

  const fetchStats = async () => {
    try {
      const backups = await apiClient.get<unknown[]>(
        "/configuracoes/backups/historico",
      );

      if (backups) {
        const totalSize = backups.reduce(
          (sum, b) => sum + (b.file_size_bytes || 0),
          0,
        );
        const successCount = backups.filter(
          (b) => b.status === "success",
        ).length;

        setStats({
          totalBackups: backups.length,
          totalSize,
          lastBackup: backups[0]?.created_at || null,
          successRate:
            backups.length > 0 ? (successCount / backups.length) * 100 : 0,
        });
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Backups"
          value={stats.totalBackups.toString()}
          icon={Database}
          variant="primary"
        />
        <StatsCard
          title="Espaço Total"
          value={`${(stats.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`}
          icon={HardDrive}
          variant="primary"
        />
        <StatsCard
          title="Último Backup"
          value={
            stats.lastBackup
              ? new Date(stats.lastBackup).toLocaleDateString()
              : "N/A"
          }
          icon={Clock}
          variant="primary"
        />
        <StatsCard
          title="Taxa de Sucesso"
          value={`${stats.successRate.toFixed(1)}%`}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral dos Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sistema de backup configurado e operacional. Todos os backups são
            criptografados e armazenados com segurança.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
