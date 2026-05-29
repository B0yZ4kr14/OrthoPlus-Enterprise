import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/patient-status";
import type { PatientStatus } from "../types";

interface StatusBadgeProps {
  status: PatientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded text-xs font-medium",
        STATUS_COLORS[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
