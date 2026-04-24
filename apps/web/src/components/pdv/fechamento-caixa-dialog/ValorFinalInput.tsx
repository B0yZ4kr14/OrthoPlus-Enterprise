import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface ValorFinalInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ValorFinalInput({ value, onChange }: ValorFinalInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="valorFinal">Valor Final do Caixa (R$)</Label>
      <Input
        id="valorFinal"
        type="number"
        step="0.01"
        placeholder="Digite o valor final"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
