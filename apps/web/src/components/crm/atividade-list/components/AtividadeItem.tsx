import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { formatDateCustom } from "@/lib/utils/date.utils";
import { CheckCircle2 } from "lucide-react";
import type { Atividade } from "../types";
import { statusLabels, statusColors } from "../constants/status";
import * as Icons from "lucide-react";

interface AtividadeItemProps {
  atividade: Atividade;
  onConcluir: (id: string, resultado?: string) => void;
}

const tipoToIcon: Record<string, string> = {
  LIGACAO: "Phone",
  EMAIL: "Mail",
  REUNIAO: "Calendar",
  WHATSAPP: "MessageSquare",
  VISITA: "MapPin",
  OUTRO: "Calendar",
};

export function AtividadeItem({ atividade, onConcluir }: AtividadeItemProps) {
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
    tipoToIcon[atividade.tipo] ?? "Calendar"
  ];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="h-4 w-4" />}
            <h4 className="font-semibold">{atividade.titulo}</h4>
            <Badge
              className={statusColors[atividade.status]}
              variant="outline"
            >
              {statusLabels[atividade.status]}
            </Badge>
          </div>

          {atividade.descricao && (
            <p className="text-sm text-muted-foreground">
              {atividade.descricao}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {atividade.dataAgendada && (
              <span>
                Agendada:{" "}
                {formatDateCustom(atividade.dataAgendada, "dd/MM/yyyy 'às' HH:mm")}
              </span>
            )}
            {atividade.dataConclusao && (
              <span>
                Concluída:{" "}
                {formatDateCustom(atividade.dataConclusao, "dd/MM/yyyy 'às' HH:mm")}
              </span>
            )}
          </div>

          {atividade.resultado && (
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              <strong>Resultado:</strong> {atividade.resultado}
            </div>
          )}
        </div>

        {atividade.status === "AGENDADA" && (
          <Button
            size="sm"
            onClick={() => onConcluir(atividade.id)}
            className="flex-shrink-0"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Concluir
          </Button>
        )}
      </div>
    </Card>
  );
}
