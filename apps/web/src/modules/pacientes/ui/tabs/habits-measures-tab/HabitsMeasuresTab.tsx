// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { HabitsSection } from "./HabitsSection";
import { VitalSignsSection } from "./VitalSignsSection";
import type { HabitsMeasuresTabProps } from "./types";

export function HabitsMeasuresTab({ form }: HabitsMeasuresTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <HabitsSection form={form} />
        <VitalSignsSection form={form} />
      </div>
    </Card>
  );
}
