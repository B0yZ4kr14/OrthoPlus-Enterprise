import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Calendar } from "lucide-react";

interface SummaryCardProps {
  firstAppointmentDate?: string;
  lastAppointmentDate?: string;
  totalAppointments?: number;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Não registrado";
  return new Date(dateString).toLocaleDateString("pt-BR");
}

export function SummaryCard({
  firstAppointmentDate,
  lastAppointmentDate,
  totalAppointments,
}: SummaryCardProps) {
  const lastAppointment = lastAppointmentDate
    ? formatDate(lastAppointmentDate)
    : "Nunca consultou";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Resumo do Histórico
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Primeira Consulta
          </label>
          <p className="text-lg font-semibold mt-2">
            {formatDate(firstAppointmentDate)}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Última Consulta
          </label>
          <p className="text-lg font-semibold mt-2">{lastAppointment}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Total de Consultas
          </label>
          <p className="text-3xl font-bold mt-2">{totalAppointments || 0}</p>
        </div>
      </CardContent>
    </Card>
  );
}
