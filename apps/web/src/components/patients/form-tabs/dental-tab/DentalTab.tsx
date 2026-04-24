import { Card } from "@orthoplus/core-ui/card";
import type { DentalTabProps } from "./types";
import { MainComplaintField } from "./MainComplaintField";
import { PainLevelField } from "./PainLevelField";
import { HygieneSelect } from "./HygieneSelect";
import { GumConditionSelect } from "./GumConditionSelect";
import { ObservationsField } from "./ObservationsField";

export function DentalTab({ form }: DentalTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <MainComplaintField form={form} />
        <PainLevelField form={form} />
        <HygieneSelect form={form} />
        <GumConditionSelect form={form} />
        <ObservationsField form={form} />
      </div>
    </Card>
  );
}
