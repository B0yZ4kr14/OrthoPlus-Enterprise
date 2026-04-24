import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";

interface ReasonInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ReasonInput({ value, onChange, disabled }: ReasonInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reason">Motivo da Mudança *</Label>
      <Textarea
        id="reason"
        placeholder="Descreva o motivo da mudança de status..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[80px]"
      />
    </div>
  );
}
