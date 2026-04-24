import { useState, useCallback } from "react";
import {
  PatientStatus,
  isValidStatusTransition,
  getStatusTransitionError,
} from "@/types/patient-status";

interface UseStatusManagerProps {
  currentStatus: PatientStatus;
  onStatusChange: (newStatus: PatientStatus, reason: string) => Promise<void>;
}

export function useStatusManager({ currentStatus, onStatusChange }: UseStatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<PatientStatus>(currentStatus);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusSelect = useCallback(
    (status: PatientStatus) => {
      setSelectedStatus(status);
      const errorMsg = getStatusTransitionError(currentStatus, status);
      setError(errorMsg);
    },
    [currentStatus],
  );

  const handleConfirm = useCallback(async () => {
    if (!isValidStatusTransition(currentStatus, selectedStatus)) {
      setError(getStatusTransitionError(currentStatus, selectedStatus));
      return;
    }

    if (!reason.trim()) {
      setError("Por favor, informe o motivo da mudança de status");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onStatusChange(selectedStatus, reason);
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao alterar status");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStatus, selectedStatus, reason, onStatusChange]);

  const handleCancel = useCallback(() => {
    setSelectedStatus(currentStatus);
    setReason("");
    setError(null);
  }, [currentStatus]);

  const hasChanges = selectedStatus !== currentStatus;

  return {
    selectedStatus,
    reason,
    error,
    isSubmitting,
    hasChanges,
    setReason,
    handleStatusSelect,
    handleConfirm,
    handleCancel,
  };
}
