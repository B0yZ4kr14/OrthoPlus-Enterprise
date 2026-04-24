import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import type { FormNumberInputProps } from "../types";

export function FormNumberInput({
  name,
  label,
  description,
  form,
  step = "0.01",
  min,
  max,
  placeholder,
}: FormNumberInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step={step}
              min={min}
              max={max}
              placeholder={placeholder}
              {...field}
              onChange={(e) =>
                field.onChange(parseFloat(e.target.value) || 0)
              }
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
