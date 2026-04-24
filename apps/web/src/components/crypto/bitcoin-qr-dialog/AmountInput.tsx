import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  coinType?: string;
}

export function AmountInput({ value, onChange, coinType }: AmountInputProps) {
  return (
    <div className="space-y-2">
      <Label>Valor em {coinType || "Crypto"} *</Label>
      <Input
        type="number"
        step="0.00000001"
        placeholder="0.00000000"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
