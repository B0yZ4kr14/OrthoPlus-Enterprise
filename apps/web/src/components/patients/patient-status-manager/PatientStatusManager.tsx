import { Label } from "@orthoplus/core-ui/label";
import type { PatientStatusManagerProps } from "./types";
import { useStatusManager } from "./useStatusManager";
import { StatusSelect } from "./StatusSelect";
import { ReasonInput } from "./ReasonInput";
import { ErrorAlert } from "./ErrorAlert";
import { ActionButtons } from "./ActionButtons";
import { StatusInfo } from "./StatusInfo";

export function PatientStatusManager({
  currentStatus,
  patientId,
  patientName,
  onStatusChange,
  disabled = false,
}: PatientStatusManagerProps) {
  const {
    selectedStatus,
    reason,
    error,
    isSubmitting,
    hasChanges,
    setReason,
    handleStatusSelect,
    handleConfirm,
    handleCancel,
  } = useStatusManager({ currentStatus, onStatusChange });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Status do Paciente</Label>
        <StatusSelect
          currentStatus={currentStatus}
          selectedStatus={selectedStatus}
          disabled={disabled || isSubmitting}
          onSelect={handleStatusSelect}
        />
      </div>

      {hasChanges && (
        <>
          <ReasonInput
            value={reason}
            onChange={setReason}
            disabled={isSubmitting}
          />

          <ErrorAlert error={error} />

          <ActionButtons
            isSubmitting={isSubmitting}
            canConfirm={!!reason.trim()}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </>
      )}

      <StatusInfo
        patientName={patientName}
        currentStatus={currentStatus}
        selectedStatus={selectedStatus}
        hasChanges={hasChanges}
      />
    </div>
  );
}
