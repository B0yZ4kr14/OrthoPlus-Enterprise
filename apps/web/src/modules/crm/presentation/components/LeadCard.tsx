import { Lead } from "@/modules/crm/domain/entities/Lead";
import { Card, CardContent, CardHeader } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import {
  Phone,
  Mail,
  Building2,
  User,
  Calendar,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getStatusColor } from "@/lib/utils/status.utils";

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onStatusChange?: (lead: Lead) => void;
}

export const LeadCard = ({
  lead,
  onEdit,
  onDelete,
  onStatusChange,
}: LeadCardProps) => {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NOVO: "Novo",
      CONTATO_INICIAL: "Contato Inicial",
      QUALIFICADO: "Qualificado",
      PROPOSTA: "Proposta Enviada",
      NEGOCIACAO: "Em Negociação",
      GANHO: "Ganho",
      PERDIDO: "Perdido",
    };
    return labels[status] || status;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {lead.nome}
            </h3>
            <Badge variant={getStatusColor(lead.status) as unknown}>
              {getStatusLabel(lead.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(lead)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(lead)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${lead.email}`}
                className="text-primary hover:underline"
              >
                {lead.email}
              </a>
            </div>
          )}

          {lead.telefone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${lead.telefone}`}
                className="text-primary hover:underline"
              >
                {lead.telefone}
              </a>
            </div>
          )}
        </div>

        {(lead.interesseDescricao || lead.valorEstimado) && (
          <div className="border-t pt-3 space-y-2">
            {lead.interesseDescricao && (
              <div className="text-sm">
                <span className="text-muted-foreground">Interesse:</span>
                <span className="ml-2 text-foreground font-medium">
                  {lead.interesseDescricao}
                </span>
              </div>
            )}

            {lead.valorEstimado && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">
                  R${" "}
                  {lead.valorEstimado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-3 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>
              Criado:{" "}
              {format(new Date(lead.createdAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>

          {lead.proximoContato && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                Próximo contato:{" "}
                {format(
                  new Date(lead.proximoContato),
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR },
                )}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span>Origem:</span>
            <Badge variant="outline" className="text-xs">
              {lead.origem}
            </Badge>
          </div>
        </div>

        {lead.observacoes && (
          <div className="border-t pt-3">
            <p className="text-sm text-muted-foreground italic">
              "{lead.observacoes}"
            </p>
          </div>
        )}

        {onStatusChange &&
          lead.status !== "GANHO" &&
          lead.status !== "PERDIDO" && (
            <div className="border-t pt-3">
              <Button
                onClick={() => onStatusChange(lead)}
                className="w-full"
                variant="outline"
              >
                Atualizar Status
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
};
