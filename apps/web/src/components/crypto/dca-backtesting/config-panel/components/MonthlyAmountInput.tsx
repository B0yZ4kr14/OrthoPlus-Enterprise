import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface MonthlyAmountInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function MonthlyAmountInput({
  value,
  onChange,
}: MonthlyAmountInputProps) {
  return (
    <div className="space-y-2">
      <Label>Valor Mensal (R$)</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={100}
        step={100}
      />
    </div>
  );
}
