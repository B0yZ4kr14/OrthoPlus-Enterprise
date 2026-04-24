import { Badge } from "@orthoplus/core-ui/badge";
import type { Patient } from "./types";

interface PatientMarketingInfoProps {
  patient: Patient;
}

export function PatientMarketingInfo({ patient }: PatientMarketingInfoProps) {
  if (!patient.marketing_campaign && !patient.marketing_source) return null;

  return (
    <div className="flex gap-2 text-xs text-muted-foreground">
      {patient.marketing_campaign && (
        <Badge variant="outline">Campanha: {patient.marketing_campaign}</Badge>
      )}
      {patient.marketing_source && (
        <Badge variant="outline">Origem: {patient.marketing_source}</Badge>
      )}
    </div>
  );
}
