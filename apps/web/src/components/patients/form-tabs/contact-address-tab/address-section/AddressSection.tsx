import type { AddressSectionProps } from "./types";
import { CEPField } from "./CEPField";
import { AddressField } from "./AddressField";
import { ADDRESS_FIELDS } from "./types";

export function AddressSection({
  form,
  loadingCEP,
  onCEPChange,
  onSearchCEP,
}: AddressSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CEPField
          form={form}
          loadingCEP={loadingCEP}
          onCEPChange={onCEPChange}
          onSearchCEP={onSearchCEP}
        />
        {ADDRESS_FIELDS.map((field) => (
          <AddressField key={field.name} form={form} field={field} />
        ))}
      </div>
    </div>
  );
}
