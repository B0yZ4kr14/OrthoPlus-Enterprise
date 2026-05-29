// cspell:disable
import { useWatch } from "react-hook-form";
import type { HabitsMeasuresTabProps } from "./types";
import { HabitToggle } from "./components/HabitToggle";
import { HabitFrequencySelect } from "./components/HabitFrequencySelect";
import {
  smokingFrequencies,
  alcoholFrequencies,
} from "./constants/frequencies";

export * from "./types";
export { HabitToggle, HabitFrequencySelect };
export { smokingFrequencies, alcoholFrequencies };

export function HabitsSection({ form }: HabitsMeasuresTabProps) {
  const hasSmokingHabit = useWatch({
    control: form.control,
    name: "has_smoking_habit",
  });

  const hasAlcoholHabit = useWatch({
    control: form.control,
    name: "has_alcohol_habit",
  });

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Hábitos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HabitToggle
          name="has_smoking_habit"
          label="Fumante?"
          control={form.control as never}
        />

        {hasSmokingHabit && (
          <HabitFrequencySelect
            name="smoking_frequency"
            label="Frequência"
            control={form.control as never}
            options={smokingFrequencies}
          />
        )}

        <HabitToggle
          name="has_alcohol_habit"
          label="Consome álcool?"
          control={form.control as never}
        />

        {hasAlcoholHabit && (
          <HabitFrequencySelect
            name="alcohol_frequency"
            label="Frequência"
            control={form.control as never}
            options={alcoholFrequencies}
          />
        )}
      </div>
    </div>
  );
}
