// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Label } from "@orthoplus/core-ui/label";
import type { Dentista } from "./types";

interface DentistaSelectProps {
  value: string;
  dentistas: Dentista[];
  onChange: (value: string) => void;
}

export function DentistaSelect({
  value,
  dentistas,
  onChange,
}: DentistaSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="dentist">Dentista *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o dentista" />
        </SelectTrigger>
        <SelectContent>
          {dentistas.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
