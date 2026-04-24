import { MapPin } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { InfoItem } from "./InfoItem";

interface AddressSectionProps {
  patient: Record<string, any>;
}

export function AddressSection({ patient }: AddressSectionProps) {
  return (
    <PatientCard title="Endereço" icon={<MapPin className="h-5 w-5" />}>
      <InfoItem
        label="Logradouro"
        value={
          <>
            {patient.address_street || "Não informado"},{" "}
            {patient.address_number || "S/N"}
            {patient.address_complement && (
              <p className="text-sm text-muted-foreground">
                {patient.address_complement}
              </p>
            )}
          </>
        }
        fullWidth
      />
      
      <InfoItem
        label="Bairro"
        value={patient.address_neighborhood || "Não informado"}
      />
      
      <InfoItem
        label="CEP"
        value={patient.address_zipcode || "Não informado"}
        mono
      />
      
      <InfoItem
        label="Cidade"
        value={patient.address_city || "Não informado"}
      />
      
      <InfoItem
        label="Estado"
        value={patient.address_state || "Não informado"}
      />
    </PatientCard>
  );
}
