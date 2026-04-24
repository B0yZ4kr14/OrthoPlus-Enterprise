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
import { maskCPF, maskRG } from "@/lib/input-masks";

interface TextFieldProps {
  form: UseFormReturn<PatientFormValues>;
  name: keyof PatientFormValues;
  label: string;
  required?: boolean;
  placeholder?: string;
  mask?: "cpf" | "rg";
}

export function TextField({
  form,
  name,
  label,
  required,
  placeholder,
  mask,
}: TextFieldProps) {
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
            <Input
              placeholder={placeholder}
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                let value = e.target.value;
                if (mask === "cpf") value = maskCPF(value);
                if (mask === "rg") value = maskRG(value);
                field.onChange(value);
              }}
              maxLength={mask === "cpf" ? 14 : mask === "rg" ? 12 : undefined}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
