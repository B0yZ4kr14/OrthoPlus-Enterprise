import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { FileText, Send, CheckCircle, XCircle } from "lucide-react";
import { useTISSStatistics } from "../../application/hooks/useTISSStatistics";
import { Skeleton } from "@orthoplus/core-ui/skeleton";

export function TISSDashboard() {
  const { data: stats, isLoading } = useTISSStatistics();

  const pendingGuides = stats?.guides.by_status.find((s: { status: string; _count: { id: number } }) => s.status === "pendente")?._count.id ?? 0;
  const sentGuides = stats?.guides.by_status.find((s: { status: string; _count: { id: number } }) => s.status === "enviada")?._count.id ?? 0;
  const approvedGuides = stats?.guides.by_status.find((s: { status: string; _count: { id: number } }) => s.status === "aprovada")?._count.id ?? 0;
  const glosadasGuides = stats?.guides.by_status.find((s: { status: string; _count: { id: number } }) => s.status === "glosada")?._count.id ?? 0;
  const totalGuides = stats?.guides.total ?? 0;

  const approvalRate = totalGuides > 0
    ? Math.round((approvedGuides / totalGuides) * 100)
    : 0;

  const statCards = [
    {
      title: "Guias Pendentes",
      value: pendingGuides.toString(),
      icon: FileText,
      description: "aguardando envio",
    },
    {
      title: "Enviadas",
      value: sentGuides.toString(),
      icon: Send,
      description: "em processamento",
    },
    {
      title: "Taxa de Aprovação",
      value: `${approvalRate}%`,
      icon: CheckCircle,
      description: "guias aprovadas",
    },
    {
      title: "Glosas",
      value: glosadasGuides.toString(),
      icon: XCircle,
      description: "guias glosadas",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
