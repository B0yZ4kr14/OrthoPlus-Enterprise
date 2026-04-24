import { Briefcase } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { InfoItem } from "./InfoItem";

interface ProfessionalSectionProps {
  patient: Record<string, any>;
}

export function ProfessionalSection({ patient }: ProfessionalSectionProps) {
  return (
    <PatientCard title="Informações Profissionais" icon={<Briefcase className="h-5 w-5" />}>
      <InfoItem
        label="Profissão"
        value={patient.occupation || "Não informado"}
      />
      
      <InfoItem
        label="Escolaridade"
        value={patient.education_level?.replace("_", " ") || "Não informado"}
      />
    </PatientCard>
  );
}
