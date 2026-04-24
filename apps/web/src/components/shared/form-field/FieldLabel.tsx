import { Label } from "@orthoplus/core-ui/label";

interface FieldLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
}

export function FieldLabel({ htmlFor, label, required }: FieldLabelProps) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}
