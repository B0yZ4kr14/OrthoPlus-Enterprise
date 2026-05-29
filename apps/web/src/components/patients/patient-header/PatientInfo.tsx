import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Edit } from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type PatientStatus,
} from "@/types/patient-status";
import type { Patient } from "./types";

interface PatientInfoProps {
  patient: Patient;
  onEdit: () => void;
}

export function PatientInfo({ patient, onEdit }: PatientInfoProps) {
  const statusColor =
    STATUS_COLORS[patient.status as PatientStatus] || "bg-muted";
  const statusLabel =
    STATUS_LABELS[patient.status as PatientStatus] || patient.status;

  return (
    <div className="flex-1 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{patient.full_name}</h1>
          {patient.social_name && (
            <p className="text-muted-foreground">
              Nome Social: {patient.social_name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className={statusColor}>
            {statusLabel}
          </Badge>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>
    </div>
  );
}
