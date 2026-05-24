import type { HabitsMeasuresTabProps } from "../types";

export type { HabitsMeasuresTabProps };

export interface HabitToggleProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface HabitFrequencySelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}
