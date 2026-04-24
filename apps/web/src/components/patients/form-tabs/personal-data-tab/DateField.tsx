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

interface DateFieldProps {
  form: UseFormReturn<PatientFormValues>;
  name: keyof PatientFormValues;
  label: string;
  required?: boolean;
}

export function DateField({ form, name, label, required }: DateFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && "*"}
          </FormLabel>
          <FormControl>
            <Input type="date" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
