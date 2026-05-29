// cspell:disable
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Users, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import type { AnalyticsData } from "./types";

interface KPICardsProps {
  analytics: AnalyticsData;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

export function KPICards({ analytics }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Onboardings Iniciados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{analytics.totalStarts}</div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success">
            {analytics.totalCompletions}
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Taxa de Conclusão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {analytics.completionRate.toFixed(1)}%
            </span>
            {analytics.completionRate >= 70 ? (
              <Badge variant="success">Excelente</Badge>
            ) : analytics.completionRate >= 50 ? (
              <Badge variant="info">Bom</Badge>
            ) : (
              <Badge variant="error">Necessita Atenção</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tempo Médio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatTime(analytics.averageTimeSeconds)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
