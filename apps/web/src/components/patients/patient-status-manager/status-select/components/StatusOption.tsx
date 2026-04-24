import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandItem } from "@orthoplus/core-ui/command";
import {
  isValidStatusTransition,
} from "@/types/patient-status";
import { StatusBadge } from "./StatusBadge";
import type { PatientStatus } from "../types";

interface StatusOptionProps {
  status: PatientStatus;
  selectedStatus: PatientStatus;
  currentStatus: PatientStatus;
  onSelect: (status: PatientStatus) => void;
}

export function StatusOption({
  status,
  selectedStatus,
  currentStatus,
  onSelect,
}: StatusOptionProps) {
  const isValid = isValidStatusTransition(currentStatus, status);
  const isDisabled = !isValid && status !== currentStatus;

  return (
    <CommandItem
      value={status}
      onSelect={() => onSelect(status)}
      disabled={isDisabled}
      className={cn(isDisabled && "opacity-50")}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          selectedStatus === status ? "opacity-100" : "opacity-0"
        )}
      />
      <StatusBadge status={status} />
      {isDisabled && (
        <span className="ml-auto text-xs text-muted-foreground">
          (Transição inválida)
        </span>
      )}
    </CommandItem>
  );
}
