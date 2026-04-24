// cspell:disable
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface TipoEquipamentoSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function TipoEquipamentoSelect({ value, onChange }: TipoEquipamentoSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo_equipamento">Tipo de Equipamento</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SAT">SAT (Sistema Autenticador e Transmissor)</SelectItem>
          <SelectItem value="MFE">MFe (Módulo Fiscal Eletrônico)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
