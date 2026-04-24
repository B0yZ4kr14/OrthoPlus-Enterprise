import { Calendar } from "lucide-react";
import type { WizardStepProps } from "./types";
import { NameInput } from "./components/NameInput";
import { FrequencySelect } from "./components/FrequencySelect";
import { TimeInput } from "./components/TimeInput";
import { WeekDaySelect } from "./components/WeekDaySelect";
import { DayOfMonthInput } from "./components/DayOfMonthInput";

export * from "./types";
export {
  NameInput,
  FrequencySelect,
  TimeInput,
  WeekDaySelect,
  DayOfMonthInput,
};
export { FREQUENCY_OPTIONS, DAY_OF_WEEK_OPTIONS } from "./constants/options";

export function BasicInfoStep({ config, setConfig }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Informações Básicas</h3>
      </div>

      <NameInput
        value={config.name}
        onChange={(value) => setConfig({ ...config, name: value })}
      />

      <FrequencySelect
        value={config.frequency}
        onChange={(value) => setConfig({ ...config, frequency: value })}
      />

      <TimeInput
        value={config.timeOfDay}
        onChange={(value) => setConfig({ ...config, timeOfDay: value })}
      />

      {config.frequency === "weekly" && (
        <WeekDaySelect
          value={config.dayOfWeek}
          onChange={(value) => setConfig({ ...config, dayOfWeek: value })}
        />
      )}

      {config.frequency === "monthly" && (
        <DayOfMonthInput
          value={config.dayOfMonth}
          onChange={(value) =>
            setConfig({ ...config, dayOfMonth: value })
          }
        />
      )}
    </div>
  );
}
