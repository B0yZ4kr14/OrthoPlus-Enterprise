import { Campaign } from "../../domain/entities/Campaign";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Play, Pause, CheckCircle, BarChart3, Users, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CampaignCardProps {
  campaign: Campaign;
  onActivate?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onViewDetails?: () => void;
}

export function CampaignCard({
  campaign,
  onActivate,
  onPause,
  onComplete,
  onViewDetails,
}: CampaignCardProps) {
  const getStatusBadge = () => {
    const statusConfig = {
      RASCUNHO: { label: "Rascunho", variant: "secondary" as const },
      ATIVA: { label: "Ativa", variant: "default" as const },
      PAUSADA: { label: "Pausada", variant: "outline" as const },
      CONCLUIDA: { label: "Concluída", variant: "success" as const },
    };

    const config = statusConfig[campaign.status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = () => {
    const typeConfig = {
      RECALL: { label: "Recall", variant: "default" as const },
      POS_CONSULTA: { label: "Pós-Consulta", variant: "secondary" as const },
      ANIVERSARIO: { label: "Aniversário", variant: "outline" as const },
      SEGMENTADA: { label: "Segmentada", variant: "destructive" as const },
    };

    const config = typeConfig[campaign.type];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{campaign.name}</CardTitle>
            {campaign.description && (
              <CardDescription>{campaign.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            {getTypeBadge()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas */}
        {campaign.metrics && (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {campaign.metrics.totalSent}
                </p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {campaign.metrics.totalOpened}
                </p>
                <p className="text-xs text-muted-foreground">Abertos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {campaign.getOpenRate().toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Taxa Abertura</p>
              </div>
            </div>
          </div>
        )}

        {/* Datas */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {campaign.scheduledDate && (
            <div>
              <strong>Agendado:</strong>{" "}
              {format(campaign.scheduledDate, "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
          )}
          {campaign.startDate && (
            <div>
              <strong>Iniciado:</strong>{" "}
              {format(campaign.startDate, "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
          )}
          {campaign.endDate && (
            <div>
              <strong>Finalizado:</strong>{" "}
              {format(campaign.endDate, "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Detalhes
        </Button>

        <div className="flex gap-2">
          {campaign.canBeActivated() && onActivate && (
            <Button size="sm" onClick={onActivate}>
              <Play className="h-4 w-4 mr-2" />
              Ativar
            </Button>
          )}

          {campaign.canBePaused() && onPause && (
            <Button size="sm" variant="outline" onClick={onPause}>
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}

          {campaign.canBeCompleted() && onComplete && (
            <Button size="sm" variant="secondary" onClick={onComplete}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluir
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
