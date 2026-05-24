import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@orthoplus/core-ui/form";
import { Input } from "@orthoplus/core-ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";
import type { AddressField } from "./types";

interface AddressFieldProps {
  form: UseFormReturn<PatientFormValues>;
  field: AddressField;
}

export function AddressField({ form, field }: AddressFieldProps) {
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            <Input
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              {...formField}
              value={String(formField.value || "")}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
