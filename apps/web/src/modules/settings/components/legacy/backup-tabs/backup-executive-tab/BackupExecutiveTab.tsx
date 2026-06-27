import { useBackupStats } from "./useBackupStats";
import { StatsGrid } from "./StatsGrid";
import { TrendChart } from "./TrendChart";

export function BackupExecutiveTab() {
  const { data: stats, isLoading } = useBackupStats();

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      <TrendChart data={stats?.trendData || []} />
    </div>
  );
}
