import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import type { FieldError, UseFormRegister } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
}

export function FormField({
  id,
  label,
  placeholder,
  type = "text",
  register,
  error,
  required,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(id, type === "number" ? { valueAsNumber: true } : undefined)}
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}
