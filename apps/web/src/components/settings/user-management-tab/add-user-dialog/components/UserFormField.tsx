import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import type { UserFormFieldProps } from "../types";

export function UserFormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: UserFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
