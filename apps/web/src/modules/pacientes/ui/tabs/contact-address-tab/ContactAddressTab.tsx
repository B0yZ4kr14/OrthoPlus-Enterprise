// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { useContactAddress } from "./useContactAddress";
import { ContactSection } from "./ContactSection";
import { AddressSection } from "./AddressSection";
import type { ContactAddressTabProps } from "./types";

export function ContactAddressTab({ form }: ContactAddressTabProps) {
  const { loadingCEP, handleSearchCEP, handlePhoneChange, handleCEPChange } = useContactAddress(form);

  return (
    <Card className="p-6 space-y-6">
      <ContactSection form={form} onPhoneChange={handlePhoneChange} />
      <AddressSection
        form={form}
        loadingCEP={loadingCEP}
        onCEPChange={handleCEPChange}
        onSearchCEP={handleSearchCEP}
      />
    </Card>
  );
}
