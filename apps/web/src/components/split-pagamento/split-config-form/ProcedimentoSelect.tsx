// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Label } from "@orthoplus/core-ui/label";
import type { Procedimento } from "./types";

interface ProcedimentoSelectProps {
  value: string | null;
  procedimentos: Procedimento[];
  onChange: (value: string) => void;
}

export function ProcedimentoSelect({
  value,
  procedimentos,
  onChange,
}: ProcedimentoSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="procedimento">Procedimento *</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o procedimento" />
        </SelectTrigger>
        <SelectContent>
          {procedimentos.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
