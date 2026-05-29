import { Phone, Mail } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { InfoItem } from "./InfoItem";

interface ContactSectionProps {
  patient: Record<string, any>;
}

export function ContactSection({ patient }: ContactSectionProps) {
  return (
    <PatientCard title="Contatos" icon={<Phone className="h-5 w-5" />}>
      <InfoItem
        label="Email"
        value={
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {patient.email || "Não informado"}
          </span>
        }
      />

      <InfoItem
        label="Telefone Principal"
        value={
          <span className="flex items-center gap-2 font-mono">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {patient.phone_primary}
          </span>
        }
        mono
      />

      {patient.phone_secondary && (
        <InfoItem
          label="Telefone Secundário"
          value={patient.phone_secondary}
          mono
        />
      )}

      {patient.phone_emergency && (
        <InfoItem
          label="Telefone de Emergência"
          value={patient.phone_emergency}
          mono
        />
      )}

      {patient.emergency_contact_name && (
        <InfoItem
          label="Contato de Emergência"
          value={
            <>
              {patient.emergency_contact_name}
              {patient.emergency_contact_relationship && (
                <p className="text-sm text-muted-foreground">
                  ({patient.emergency_contact_relationship})
                </p>
              )}
            </>
          }
        />
      )}
    </PatientCard>
  );
}
