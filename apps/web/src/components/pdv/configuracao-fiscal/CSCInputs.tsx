// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import type { FiscalFormData } from "./types";

interface CSCInputsProps {
  formData: FiscalFormData;
  onChange: <K extends keyof FiscalFormData>(field: K, value: FiscalFormData[K]) => void;
}

export function CSCInputs({ formData, onChange }: CSCInputsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="csc_id">CSC ID</Label>
        <Input
          id="csc_id"
          value={formData.csc_id}
          onChange={(e) => onChange("csc_id", e.target.value)}
          placeholder="Código de Segurança do Contribuinte"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="csc_token">CSC Token</Label>
        <Input
          id="csc_token"
          type="password"
          value={formData.csc_token}
          onChange={(e) => onChange("csc_token", e.target.value)}
        />
      </div>
    </>
  );
}
