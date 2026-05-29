// cspell:disable
import { Label } from "@orthoplus/core-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Input } from "@orthoplus/core-ui/input";
import type { FiscalFormData } from "./types";

interface RegimeTributarioSelectProps {
  formData: FiscalFormData;
  onChange: <K extends keyof FiscalFormData>(
    field: K,
    value: FiscalFormData[K],
  ) => void;
}

export function RegimeTributarioSelect({
  formData,
  onChange,
}: RegimeTributarioSelectProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="regime_tributario">Regime Tributário</Label>
        <Select
          value={formData.regime_tributario}
          onValueChange={(value) =>
            onChange(
              "regime_tributario",
              value as FiscalFormData["regime_tributario"],
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
            <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
            <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serie_nfce">Série NFCe</Label>
        <Input
          id="serie_nfce"
          type="number"
          value={formData.serie_nfce}
          onChange={(e) => onChange("serie_nfce", parseInt(e.target.value))}
        />
      </div>
    </>
  );
}
