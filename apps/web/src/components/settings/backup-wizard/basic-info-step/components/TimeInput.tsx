import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeInput({ value, onChange }: TimeInputProps) {
  return (
    <div className="space-y-2">
      <Label>Horário</Label>
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
