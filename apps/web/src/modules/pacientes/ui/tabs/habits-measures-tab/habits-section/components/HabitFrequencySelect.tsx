import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@orthoplus/core-ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { Control } from "react-hook-form";

interface FrequencyOption {
  value: string;
  label: string;
}

interface HabitFrequencySelectProps {
  name: string;
  label: string;
  control: Control<Record<string, unknown>>;
  options: FrequencyOption[];
}

export function HabitFrequencySelect({
  name,
  label,
  control,
  options,
}: HabitFrequencySelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={String(field.value || "")}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
