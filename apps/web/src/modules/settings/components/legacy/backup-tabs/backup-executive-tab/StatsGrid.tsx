import { Database, TrendingUp, HardDrive, Clock } from "lucide-react";
import { StatCard } from "./StatCard";
import type { BackupStats } from "./types";

interface StatsGridProps {
  stats: BackupStats | undefined;
}

function formatBytes(bytes: number, divisor: number, unit: string): string {
  return (bytes / divisor).toFixed(unit === "GB" ? 2 : 0) + " " + unit;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      icon: Database,
      iconColorClass: "text-primary",
      bgColorClass: "bg-primary/10",
      label: "Total de Backups",
      value: String(stats?.totalBackups || 0),
    },
    {
      icon: TrendingUp,
      iconColorClass: "text-success",
      bgColorClass: "bg-success/10",
      label: "Taxa de Sucesso",
      value: `${(stats?.successRate || 0).toFixed(1)}%`,
    },
    {
      icon: HardDrive,
      iconColorClass: "text-warning",
      bgColorClass: "bg-warning/10",
      label: "Espaço Usado",
      value: formatBytes(stats?.totalSize || 0, 1024 * 1024 * 1024, "GB"),
    },
    {
      icon: Clock,
      iconColorClass: "text-info",
      bgColorClass: "bg-info/10",
      label: "Tamanho Médio",
      value: formatBytes(stats?.avgSize || 0, 1024 * 1024, "MB"),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
