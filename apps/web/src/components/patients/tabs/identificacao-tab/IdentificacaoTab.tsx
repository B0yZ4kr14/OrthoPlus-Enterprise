import type { IdentificacaoTabProps } from "./types";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactSection } from "./ContactSection";
import { AddressSection } from "./AddressSection";
import { ProfessionalSection } from "./ProfessionalSection";

export function IdentificacaoTab({ patient }: IdentificacaoTabProps) {
  return (
    <div className="space-y-6">
      <PersonalInfoSection patient={patient} />
      <ContactSection patient={patient} />
      <AddressSection patient={patient} />
      <ProfessionalSection patient={patient} />
    </div>
  );
}
