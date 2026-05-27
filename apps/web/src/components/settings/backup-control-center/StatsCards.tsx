import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { HardDrive, Download, Clock, CheckCircle } from "lucide-react";
import type { BackupStats } from "./types";

interface StatsCardsProps {
  stats: BackupStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total de Backups",
      value: stats.totalBackups,
      subtitle: "Backups realizados",
      icon: HardDrive,
      iconClass: "text-muted-foreground",
    },
    {
      title: "Espaço Usado",
      value: stats.storageUsed,
      subtitle: "De 50 GB disponíveis",
      icon: Download,
      iconClass: "text-muted-foreground",
    },
    {
      title: "Último Backup",
      value: "Hoje",
      subtitle: stats.lastBackup,
      icon: Clock,
      iconClass: "text-muted-foreground",
    },
    {
      title: "Taxa de Sucesso",
      value: stats.successRate,
      subtitle: "Últimos 30 dias",
      icon: CheckCircle,
      iconClass: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.iconClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
