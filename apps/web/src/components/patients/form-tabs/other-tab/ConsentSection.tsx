import { ConsentCheckbox } from "./ConsentCheckbox";
import type { OtherTabProps } from "./types";
import { CONSENT_FIELDS } from "./types";

export function ConsentSection({ form }: OtherTabProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Consentimentos (LGPD)</h3>
      <div className="space-y-4">
        {CONSENT_FIELDS.map((field) => (
          <ConsentCheckbox key={field.name} form={form} field={field} />
        ))}
      </div>
    </div>
  );
}
