// cspell:disable
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import type { FiscalFormData } from "./types";

interface AmbienteSelectProps {
  value: FiscalFormData["ambiente"];
  onChange: (value: FiscalFormData["ambiente"]) => void;
}

export function AmbienteSelect({ value, onChange }: AmbienteSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="ambiente">Ambiente</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
          <SelectItem value="PRODUCAO">Produção</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
