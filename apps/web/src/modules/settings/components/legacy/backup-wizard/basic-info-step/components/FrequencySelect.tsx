import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { FREQUENCY_OPTIONS } from "../constants/options";
import type { Frequency } from "../types";

interface FrequencySelectProps {
  value: Frequency;
  onChange: (value: Frequency) => void;
}

export function FrequencySelect({ value, onChange }: FrequencySelectProps) {
  return (
    <div className="space-y-2">
      <Label>Frequência</Label>
      <Select value={value} onValueChange={(v) => onChange(v as Frequency)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
