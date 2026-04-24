import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@orthoplus/core-ui/form";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import type { Control } from "react-hook-form";

interface HabitToggleProps {
  name: string;
  label: string;
  control: Control<Record<string, unknown>>;
}

export function HabitToggle({ name, label, control }: HabitToggleProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
          </div>
        </FormItem>
      )}
    />
  );
}
