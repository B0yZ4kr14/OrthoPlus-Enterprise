import { Database, CheckCircle, Clock, XCircle } from "lucide-react";
import { StatCard } from "./StatCard";
import type { ReplicationStats } from "./types";

interface StatsGridProps {
  stats: ReplicationStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    {
      icon: Database,
      iconColorClass: "text-primary",
      bgColorClass: "bg-primary/10",
      label: "Total de Replicações",
      value: stats.total,
    },
    {
      icon: CheckCircle,
      iconColorClass: "text-success",
      bgColorClass: "bg-success/10",
      label: "Completos",
      value: stats.completed,
    },
    {
      icon: Clock,
      iconColorClass: "text-warning",
      bgColorClass: "bg-warning/10",
      label: "Pendentes",
      value: stats.pending,
    },
    {
      icon: XCircle,
      iconColorClass: "text-destructive",
      bgColorClass: "bg-destructive/10",
      label: "Falhas",
      value: stats.failed,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
