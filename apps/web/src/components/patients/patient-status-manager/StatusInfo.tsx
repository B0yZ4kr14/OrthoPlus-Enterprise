import { STATUS_LABELS } from "@/types/patient-status";
import type { PatientStatus } from "@/types/patient-status";

interface StatusInfoProps {
  patientName: string;
  currentStatus: PatientStatus;
  selectedStatus: PatientStatus;
  hasChanges: boolean;
}

export function StatusInfo({
  patientName,
  currentStatus,
  selectedStatus,
  hasChanges,
}: StatusInfoProps) {
  return (
    <div className="text-sm text-muted-foreground">
      Paciente: <strong>{patientName}</strong>
      <br />
      Status Atual: <strong>{STATUS_LABELS[currentStatus]}</strong>
      {hasChanges && (
        <>
          <br />
          Novo Status: <strong>{STATUS_LABELS[selectedStatus]}</strong>
        </>
      )}
    </div>
  );
}
