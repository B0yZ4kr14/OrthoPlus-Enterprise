import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface DayOfMonthInputProps {
  value?: number;
  onChange: (value: number) => void;
}

export function DayOfMonthInput({ value, onChange }: DayOfMonthInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="backup-day">Dia do Mês</Label>
      <Input
        id="backup-day"
        type="number"
        min="1"
        max="31"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
    </div>
  );
}
