import { useState } from "react";
import { Calendar, CalendarDays, Clock, Plus, Settings } from "lucide-react";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import {
  AgendaProvider,
  useAgenda,
} from "../../presentation/contexts/AgendaContext";
import { useAppointments } from "../../presentation/hooks/useAppointments";
import { useDentistSchedules } from "../../presentation/hooks/useDentistSchedules";
import { useBlockedTimes } from "../../presentation/hooks/useBlockedTimes";
import { useAuth } from "@/contexts/AuthContext";
import { WeekCalendar } from "../components/WeekCalendar";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentCard } from "../components/AppointmentCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppointmentDetailsDialog } from "../components/AppointmentDetailsDialog";
import { DentistScheduleForm } from "../components/DentistScheduleForm";
import { BlockedTimeForm } from "../components/BlockedTimeForm";
import { Appointment } from "../../domain/entities/Appointment";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@orthoplus/core-ui/card";
import { CardTopBorder } from "@/components/shared/CardTopBorder";

function AgendaContent() {
  const { clinicId } = useAuth();
  const { weekStart } = useAgenda();
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const {
    appointments,
    isLoading: isLoadingAppointments,
    createAppointment,
    confirmAppointment,
    cancelAppointment,
    updateAppointment,
    isCreating,
    isUpdating,
  } = useAppointments({
    clinicId: clinicId || undefined,
    startDate: weekStart,
    endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
  });

  const {
    createSchedule,
    isCreating: isCreatingSchedule,
  } = useDentistSchedules({
    clinicId: clinicId || undefined,
  });

  const { createBlockedTime, isCreating: isCreatingBlock } = useBlockedTimes({
    clinicId: clinicId || undefined,
  });

  const handleCreateAppointment = (data: {
    patientId: string;
    dentistId: string;
    scheduledDatetime: Date;
    durationMinutes: number;
    appointmentType: string;
    notes?: string;
  }) => {
    createAppointment(
      { ...data, clinicId: clinicId || "" },
      { onSuccess: () => setIsAppointmentDialogOpen(false) },
    );
  };

  const handleCreateSchedule = (data: {
    dentistId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  }) => {
    createSchedule(
      { ...data, clinicId: clinicId || "" },
      { onSuccess: () => setIsScheduleDialogOpen(false) },
    );
  };

  const handleCreateBlock = (data: {
    dentistId: string;
    startDatetime: Date;
    endDatetime: Date;
    reason: string;
  }) => {
    createBlockedTime(
      { ...data, clinicId: clinicId || "" },
      { onSuccess: () => setIsBlockDialogOpen(false) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Agenda"
        description="Gerencie agendamentos, horários e bloqueios"
        actions={
          <div className="flex items-center gap-2">
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Horários
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Horário</DialogTitle>
                </DialogHeader>
                <DentistScheduleForm onSubmit={handleCreateSchedule} isLoading={isCreatingSchedule} />
              </DialogContent>
            </Dialog>

            <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Bloquear
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bloquear Horário</DialogTitle>
                </DialogHeader>
                <BlockedTimeForm onSubmit={handleCreateBlock} isLoading={isCreatingBlock} />
              </DialogContent>
            </Dialog>

            <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 glow-interactive">
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                <AppointmentForm onSubmit={handleCreateAppointment} isLoading={isCreating} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-1 max-w-md">
          <TabsTrigger value="calendar" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <Card className="glass-card overflow-hidden">
            <CardTopBorder color="interactive" opacity={30} />
            <div className="p-1">
              <WeekCalendar
                appointments={appointments}
                onAppointmentClick={(apt) => {
                  setSelectedAppointment(apt);
                  setIsDetailsOpen(true);
                }}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {isLoadingAppointments ? (
            <LoadingState variant="grid" rows={3} />
          ) : appointments.length === 0 ? (
            <Card className="glass-card overflow-hidden">
              <CardTopBorder color="warning" opacity={40} />
              <EmptyState
                icon={CalendarDays}
                message="Nenhum agendamento"
                description="Não há agendamentos para este período."
                action={{ label: "Novo Agendamento", onClick: () => setIsAppointmentDialogOpen(true) }}
              />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onConfirm={() => confirmAppointment(appointment.id)}
                  onCancel={() => cancelAppointment({ appointmentId: appointment.id })}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedAppointment(null);
        }}
        onUpdate={updateAppointment}
        onConfirm={confirmAppointment}
        onCancel={cancelAppointment}
        isUpdating={isUpdating}
      />
    </div>
  );
}

export function AgendaPage() {
  return (
    <AgendaProvider>
      <AgendaContent />
    </AgendaProvider>
  );
}
