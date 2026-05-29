import type { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

export interface AddressSectionProps {
  form: UseFormReturn<PatientFormValues>;
  loadingCEP: boolean;
  onCEPChange: (value: string) => string;
  onSearchCEP: () => void;
}

export interface AddressField {
  name: keyof PatientFormValues;
  label: string;
  placeholder: string;
  maxLength?: number;
}

export const ADDRESS_FIELDS: AddressField[] = [
  {
    name: "address_street",
    label: "Logradouro",
    placeholder: "Rua, Avenida...",
  },
  { name: "address_number", label: "Número", placeholder: "123" },
  {
    name: "address_complement",
    label: "Complemento",
    placeholder: "Apto, Bloco...",
  },
  { name: "address_neighborhood", label: "Bairro", placeholder: "Bairro" },
  { name: "address_city", label: "Cidade", placeholder: "Cidade" },
  {
    name: "address_state",
    label: "Estado (UF)",
    placeholder: "SP",
    maxLength: 2,
  },
  { name: "address_country", label: "País", placeholder: "Brasil" },
];
