// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import type { FormData } from "./types";

interface RedeInputsProps {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function RedeInputs({ formData, onChange }: RedeInputsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="ip_address">Endereço IP (para MFe em rede)</Label>
        <Input
          id="ip_address"
          value={formData.ip_address}
          onChange={(e) => onChange("ip_address", e.target.value)}
          placeholder="Ex: 192.168.1.100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="porta">Porta (para MFe em rede)</Label>
        <Input
          id="porta"
          type="number"
          value={formData.porta}
          onChange={(e) => onChange("porta", Number(e.target.value))}
          placeholder="7000"
        />
      </div>
    </>
  );
}
