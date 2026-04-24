import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface OriginInputProps {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OriginInput({ value, onChange, disabled }: OriginInputProps) {
  return (
    <div className="space-y-2">
      <Label>Origem do Lead</Label>
      <Input
        placeholder="Ex: Landing Page Implantes 2025"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
