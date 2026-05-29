import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import type { VitalSignsSectionProps } from "./types";
import type { VitalField } from "./types";

interface NumericFieldProps extends VitalSignsSectionProps {
  field: VitalField;
}

export function NumericField({ form, field }: NumericFieldProps) {
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step={field.step || "1"}
              placeholder={field.placeholder}
              {...formField}
              value={String(formField.value || "")}
              disabled={field.disabled}
              onChange={(e) =>
                formField.onChange(
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
