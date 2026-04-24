import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { useParcelas } from "../hooks/useParcelas";

interface ParcelasSelectProps {
  valorTotal: number;
  value: number;
  onChange: (value: number) => void;
}

export function ParcelasSelect({
  valorTotal,
  value,
  onChange,
}: ParcelasSelectProps) {
  const parcelas = useParcelas(valorTotal);

  return (
    <div>
      <Label>Número de Parcelas</Label>
      <Select
        value={value.toString()}
        onValueChange={(v) => onChange(parseInt(v))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {parcelas.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
