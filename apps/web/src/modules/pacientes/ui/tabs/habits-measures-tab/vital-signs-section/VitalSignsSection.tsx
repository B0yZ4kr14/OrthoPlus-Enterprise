import type { VitalSignsSectionProps } from "./types";
import { NumericField } from "./NumericField";
import { BloodTypeSelect } from "./BloodTypeSelect";
import { VITAL_FIELDS } from "./types";

export function VitalSignsSection({ form }: VitalSignsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Medidas Vitais</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First row: BP Systolic, BP Diastolic, Heart Rate */}
        <NumericField form={form} field={VITAL_FIELDS[0]} />
        <NumericField form={form} field={VITAL_FIELDS[1]} />
        <NumericField form={form} field={VITAL_FIELDS[2]} />

        {/* Second row: Blood Type, Weight, Height */}
        <BloodTypeSelect form={form} />
        <NumericField form={form} field={VITAL_FIELDS[3]} />
        <NumericField form={form} field={VITAL_FIELDS[4]} />

        {/* Third row: BMI */}
        <NumericField form={form} field={VITAL_FIELDS[5]} />
      </div>
    </div>
  );
}
