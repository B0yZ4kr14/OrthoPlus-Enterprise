// cspell:disable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Label } from "@orthoplus/core-ui/label";
import type { SplitConfigFormData } from "./types";

interface TipoSplitSelectProps {
  value: SplitConfigFormData["tipo_split"];
  onChange: (value: SplitConfigFormData["tipo_split"]) => void;
}

export function TipoSplitSelect({ value, onChange }: TipoSplitSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo_split">Tipo de Split *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PROCEDIMENTO">Por Procedimento</SelectItem>
          <SelectItem value="GLOBAL">Global</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
