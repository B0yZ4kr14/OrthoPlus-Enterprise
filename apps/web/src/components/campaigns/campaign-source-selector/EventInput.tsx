import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface EventInputProps {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EventInput({ value, onChange, disabled }: EventInputProps) {
  return (
    <div className="space-y-2">
      <Label>Evento de Captação</Label>
      <Input
        placeholder="Ex: Feira Odontológica São Paulo 2025"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
