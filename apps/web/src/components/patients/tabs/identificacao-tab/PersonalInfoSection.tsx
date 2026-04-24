import { User } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { InfoItem } from "./InfoItem";
import { usePatientAge } from "./usePatientAge";

interface PersonalInfoSectionProps {
  patient: Record<string, any>;
}

export function PersonalInfoSection({ patient }: PersonalInfoSectionProps) {
  const { calculateAge } = usePatientAge();

  return (
    <PatientCard title="Dados Pessoais" icon={<User className="h-5 w-5" />}>
      <InfoItem label="Nome Completo" value={patient.full_name} />
      
      {patient.social_name && (
        <InfoItem label="Nome Social" value={patient.social_name} />
      )}
      
      <InfoItem
        label="CPF"
        value={patient.cpf || "Não informado"}
        mono
      />
      
      <InfoItem
        label="RG"
        value={patient.rg || "Não informado"}
        mono
      />
      
      <InfoItem
        label="Data de Nascimento"
        value={
          <>
            {new Date(patient.birth_date).toLocaleDateString("pt-BR")}
            <span className="text-sm text-muted-foreground ml-2">
              ({calculateAge(patient.birth_date)} anos)
            </span>
          </>
        }
      />
      
      <InfoItem
        label="Gênero"
        value={patient.gender?.replace("_", " ") || "Não informado"}
      />
      
      <InfoItem
        label="Estado Civil"
        value={patient.marital_status?.replace("_", " ") || "Não informado"}
      />
      
      <InfoItem label="Nacionalidade" value={patient.nationality} />
    </PatientCard>
  );
}
