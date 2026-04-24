import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface PeriodSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const periodOptions = [
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses" },
  { value: 24, label: "24 meses" },
  { value: 36, label: "36 meses" },
];

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Período (meses)</Label>
      <Select
        value={value.toString()}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
