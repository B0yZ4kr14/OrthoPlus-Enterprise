import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";

interface SoftwareSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SoftwareSelect({ value, onChange }: SoftwareSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="software">Software Contábil *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TOTVS">TOTVS Protheus</SelectItem>
          <SelectItem value="SAP">SAP Business One</SelectItem>
          <SelectItem value="CONTA_AZUL">Conta Azul</SelectItem>
          <SelectItem value="OUTROS">Outros</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
