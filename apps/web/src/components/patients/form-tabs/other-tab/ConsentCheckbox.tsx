import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@orthoplus/core-ui/form";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import type { OtherTabProps } from "./types";
import type { ConsentField } from "./types";

interface ConsentCheckboxProps extends OtherTabProps {
  field: ConsentField;
}

export function ConsentCheckbox({ form, field }: ConsentCheckboxProps) {
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={formField.value || false}
              onCheckedChange={formField.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{field.label}</FormLabel>
            <FormDescription>{field.description}</FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
}
