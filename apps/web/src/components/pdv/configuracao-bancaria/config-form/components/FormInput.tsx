import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FormInputProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
