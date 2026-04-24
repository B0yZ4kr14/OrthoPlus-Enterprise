// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import type { TipoRecompensa } from "./types";

interface ValorDescontoInputProps {
  tipo: TipoRecompensa;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function ValorDescontoInput({ tipo, value, onChange }: ValorDescontoInputProps) {
  if (tipo !== "DESCONTO_PERCENTUAL" && tipo !== "DESCONTO_VALOR") {
    return null;
  }

  const label = tipo === "DESCONTO_PERCENTUAL" ? "Desconto (%)" : "Desconto (R$)";
  const min = tipo === "DESCONTO_PERCENTUAL" ? 1 : 0.01;
  const max = tipo === "DESCONTO_PERCENTUAL" ? 100 : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor="valor_desconto">{label}</Label>
      <Input
        id="valor_desconto"
        type="number"
        min={min}
        max={max}
        step={tipo === "DESCONTO_PERCENTUAL" ? 1 : 0.01}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        placeholder={label}
      />
    </div>
  );
}
