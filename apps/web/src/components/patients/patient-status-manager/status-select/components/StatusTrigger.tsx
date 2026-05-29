import { Button } from "@orthoplus/core-ui/button";
import { ChevronsUpDown } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { PatientStatus } from "../types";

interface StatusTriggerProps {
  selectedStatus: PatientStatus;
  disabled?: boolean;
}

export function StatusTrigger({
  selectedStatus,
  disabled,
}: StatusTriggerProps) {
  return (
    <Button
      variant="outline"
      role="combobox"
      disabled={disabled}
      className="w-full justify-between"
    >
      <StatusBadge status={selectedStatus} />
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );
}
