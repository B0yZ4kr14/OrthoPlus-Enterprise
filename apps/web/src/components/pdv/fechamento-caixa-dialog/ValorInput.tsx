import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface ValorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ValorInput({ value, onChange }: ValorInputProps) {
  return (
    <div>
      <Label htmlFor="valorFinal">Valor Contado em Dinheiro (R$) *</Label>
      <Input
        id="valorFinal"
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="text-lg font-semibold"
      />
      <p className="text-sm text-muted-foreground mt-1">
        Conte todo o dinheiro no caixa e informe o valor total
      </p>
    </div>
  );
}
