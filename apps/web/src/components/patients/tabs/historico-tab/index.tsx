import type { HistoricoTabProps } from "./types";
import { SummaryCard } from "./components/SummaryCard";
import { TimelinePlaceholder } from "./components/TimelinePlaceholder";
import { RegistrationInfo } from "./components/RegistrationInfo";

export * from "./types";
export { SummaryCard, TimelinePlaceholder, RegistrationInfo };

export function HistoricoTab({ patient }: HistoricoTabProps) {
  return (
    <div className="space-y-6">
      <SummaryCard
        firstAppointmentDate={patient.first_appointment_date}
        lastAppointmentDate={patient.last_appointment_date}
        totalAppointments={patient.total_appointments}
      />

      <TimelinePlaceholder />

      <RegistrationInfo
        createdAt={patient.created_at}
        updatedAt={patient.updated_at}
        status={patient.status}
      />
    </div>
  );
}
