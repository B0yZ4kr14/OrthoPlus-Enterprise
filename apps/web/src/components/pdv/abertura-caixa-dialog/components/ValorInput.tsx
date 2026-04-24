import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";

interface ValorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ValorInput({ value, onChange }: ValorInputProps) {
  return (
    <div>
      <Label htmlFor="valor">Valor Inicial em Dinheiro (R$)</Label>
      <Input
        id="valor"
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="text-lg font-semibold"
      />
      <p className="text-sm text-muted-foreground mt-1">
        Informe o valor em dinheiro disponível no início do expediente
      </p>
    </div>
  );
}
