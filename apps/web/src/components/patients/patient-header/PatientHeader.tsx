import { Card } from "@orthoplus/core-ui/card";
import { Avatar, AvatarFallback } from "@orthoplus/core-ui/avatar";
import { usePatientHeader } from "./usePatientHeader";
import { PatientInfo } from "./PatientInfo";
import { PatientContactInfo } from "./PatientContactInfo";
import { PatientMarketingInfo } from "./PatientMarketingInfo";
import type { PatientHeaderProps } from "./types";

export function PatientHeader({ patientId }: PatientHeaderProps) {
  const { patient, isLoading, initials, handleEdit } = usePatientHeader({ patientId });

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (!patient) {
    return <div className="text-center text-muted-foreground">Paciente não encontrado</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <PatientInfo patient={patient} onEdit={handleEdit} />
          <PatientContactInfo patient={patient} />
          <PatientMarketingInfo patient={patient} />
        </div>
      </div>
    </Card>
  );
}
