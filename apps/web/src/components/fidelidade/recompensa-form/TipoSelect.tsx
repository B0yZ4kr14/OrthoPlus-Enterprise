// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Label } from "@orthoplus/core-ui/label";
import { TIPO_OPCOES } from "./constants";
import type { TipoRecompensa } from "./types";

interface TipoSelectProps {
  value: TipoRecompensa;
  onChange: (value: TipoRecompensa) => void;
}

export function TipoSelect({ value, onChange }: TipoSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo">Tipo</Label>
      <Select value={value} onValueChange={(v) => onChange(v as TipoRecompensa)}>
        <SelectTrigger id="tipo">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          {TIPO_OPCOES.map((opcao) => (
            <SelectItem key={opcao.value} value={opcao.value}>
              {opcao.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
