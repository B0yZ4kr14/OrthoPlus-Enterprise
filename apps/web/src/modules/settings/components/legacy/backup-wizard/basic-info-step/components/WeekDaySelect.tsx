import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { DAY_OF_WEEK_OPTIONS } from "../constants/options";

interface WeekDaySelectProps {
  value?: number;
  onChange: (value: number) => void;
}

export function WeekDaySelect({ value, onChange }: WeekDaySelectProps) {
  return (
    <div className="space-y-2">
      <Label>Dia da Semana</Label>
      <Select
        value={value?.toString()}
        onValueChange={(v) => onChange(parseInt(v))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o dia" />
        </SelectTrigger>
        <SelectContent>
          {DAY_OF_WEEK_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
