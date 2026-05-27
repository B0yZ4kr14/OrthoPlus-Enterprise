/**
 * PatientTimeline Component
 * Renderiza timeline cronológica de eventos do paciente
 */

import { memo } from "react";
import {
  Calendar,
  Activity,
  FileText,
  User,
  CreditCard,
  FileImage,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import { formatDate } from "@/lib/utils/date.utils";
import type { TimelineEvent } from "../hooks/usePatientTimeline";

interface PatientTimelineProps {
  events: TimelineEvent[];
  isLoading: boolean;
  filterType?: string;
  dateFrom?: string;
  dateTo?: string;
}

const ICON_MAP = {
  appointment: Calendar,
  treatment: Activity,
  budget: FileText,
  status_change: User,
  payment: CreditCard,
  document: FileImage,
};

const COLOR_MAP: Record<string, string> = {
  appointment: "bg-blue-100 text-info dark:bg-blue-900/30 dark:text-blue-300",
  treatment: "bg-success/10 text-success dark:bg-success/20 dark:text-success",
  budget: "bg-warning/10 text-warning dark:bg-warning/30 dark:text-warning",
  status_change: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  payment: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  document: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const LABEL_MAP: Record<string, string> = {
  appointment: "Agendamento",
  treatment: "Tratamento",
  budget: "Orçamento",
  status_change: "Status",
  payment: "Pagamento",
  document: "Documento",
};

export const PatientTimeline = memo(function PatientTimeline({
  events,
  isLoading,
  filterType,
  dateFrom,
  dateTo,
}: PatientTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const filteredEvents = events.filter((event) => {
    if (filterType && event.type !== filterType) return false;
    if (dateFrom && new Date(event.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(event.date) > new Date(dateTo)) return false;
    return true;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (!sortedEvents.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {events.length > 0
              ? "Nenhum evento corresponde aos filtros aplicados."
              : "Nenhum evento registrado para este paciente."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Timeline de Eventos
          <Badge variant="secondary">{events.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-4">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {sortedEvents.map((event, index) => {
              const Icon = ICON_MAP[event.type] ?? Calendar;
              const colorClass = COLOR_MAP[event.type] ?? COLOR_MAP.status_change;
              const label = LABEL_MAP[event.type] ?? event.type;

              return (
                <div key={`${event.id}-${index}`} className="relative flex items-start gap-3">
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate" title={event.title}>
                        {event.title}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {event.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(event.date, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-3" />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
