import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { OPERATION_OPTIONS } from "../../types";
import type { TEFOperationType } from "../types";

interface OperationSelectProps {
  value: TEFOperationType;
  onChange: (value: TEFOperationType) => void;
}

export function OperationSelect({ value, onChange }: OperationSelectProps) {
  return (
    <div>
      <Label>Tipo de Operação</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as TEFOperationType)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPERATION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
