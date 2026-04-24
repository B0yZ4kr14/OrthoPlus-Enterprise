// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";

interface PontosInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function PontosInput({ value, onChange }: PontosInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="pontos">Pontos Necessários *</Label>
      <Input
        id="pontos"
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        required
      />
    </div>
  );
}
