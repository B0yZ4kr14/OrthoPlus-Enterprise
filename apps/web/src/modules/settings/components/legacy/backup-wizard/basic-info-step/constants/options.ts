import type { FrequencyOption, DayOfWeekOption } from "../types";

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

export const DAY_OF_WEEK_OPTIONS: DayOfWeekOption[] = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
];
