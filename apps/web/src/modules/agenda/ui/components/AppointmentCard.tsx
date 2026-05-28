import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Appointment } from "../../domain/entities/Appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  isLoading?: boolean;
}

const statusColors = {
  AGENDADO: "bg-info/10 text-info border-info/20",
  CONFIRMADO: "bg-success/10 text-success border-success/20",
  REALIZADO: "bg-muted text-muted-foreground border-border",
  CANCELADO: "bg-destructive/10 text-destructive border-destructive/20",
  FALTOU: "bg-warning/10 text-warning border-warning/20",
};

const statusLabels = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  REALIZADO: "Realizado",
  CANCELADO: "Cancelado",
  FALTOU: "Faltou",
};

export function AppointmentCard({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
  isLoading,
}: AppointmentCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow"
      data-testid="appointment-item"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(appointment.scheduledDatetime, "dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(appointment.scheduledDatetime, "HH:mm")} -{" "}
                {format(appointment.endDatetime, "HH:mm")}
              </span>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[appointment.status]}>
            {statusLabels[appointment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Paciente ID: {appointment.patientId}</span>
        </div>

        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{appointment.appointmentType}</span>
        </div>

        {appointment.notes && (
          <p className="text-sm text-muted-foreground">{appointment.notes}</p>
        )}

        <div className="flex gap-2 pt-2">
          {appointment.canBeConfirmed && onConfirm && (
            <Button size="sm" onClick={onConfirm} disabled={isLoading} data-testid="appointment-confirm-button">
              Confirmar
            </Button>
          )}
          {appointment.canBeRescheduled && onReschedule && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReschedule}
              disabled={isLoading}
              data-testid="appointment-reschedule-button"
            >
              Reagendar
            </Button>
          )}
          {appointment.canBeCancelled && onCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="appointment-cancel-button"
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
