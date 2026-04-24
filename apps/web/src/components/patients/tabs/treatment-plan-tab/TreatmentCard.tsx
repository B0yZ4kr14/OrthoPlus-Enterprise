import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { ClipboardPlus } from "lucide-react";
import { formatDate } from "@/lib/utils/date.utils";
import type { Treatment } from "./types";
import type { ReactNode } from "react";

interface TreatmentCardProps {
  treatment: Treatment;
  statusIcon: ReactNode;
  statusLabel: string;
}

export function TreatmentCard({ treatment, statusIcon, statusLabel }: TreatmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardPlus className="h-5 w-5" />
              {treatment.titulo}
            </CardTitle>
            <CardDescription>Dente: {treatment.dente_codigo || "Não especificado"}</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {statusIcon}
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Data Início:</span>{" "}
            {treatment.data_inicio
              ? formatDate(treatment.data_inicio)
              : "Não iniciado"}
          </div>
          <div>
            <span className="font-semibold">Data Conclusão:</span>{" "}
            {treatment.data_conclusao
              ? formatDate(treatment.data_conclusao)
              : "Em andamento"}
          </div>
          {treatment.valor_estimado && (
            <div>
              <span className="font-semibold">Valor Estimado:</span> R${" "}
              {treatment.valor_estimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          )}
          {treatment.descricao && (
            <div>
              <span className="font-semibold">Descrição:</span> {treatment.descricao}
            </div>
          )}
        </div>
        {treatment.observacoes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{treatment.observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
