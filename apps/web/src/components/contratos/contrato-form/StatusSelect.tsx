import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Label } from "@orthoplus/core-ui/label";
import { STATUS_OPTIONS } from "./types";

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id="status">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
