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

interface TipoEmissaoSelectProps {
  value: FiscalFormData["tipo_emissao"];
  onChange: (value: FiscalFormData["tipo_emissao"]) => void;
}

export function TipoEmissaoSelect({ value, onChange }: TipoEmissaoSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo_emissao">Tipo de Emissão</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="NFCE">NFCe</SelectItem>
          <SelectItem value="SAT">SAT</SelectItem>
          <SelectItem value="MFE">MFe</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
