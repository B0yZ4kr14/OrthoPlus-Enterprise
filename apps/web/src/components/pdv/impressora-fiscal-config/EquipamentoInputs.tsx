// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import type { FormData } from "./types";

interface EquipamentoInputsProps {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

export function EquipamentoInputs({ formData, onChange }: EquipamentoInputsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fabricante">Fabricante</Label>
        <Input
          id="fabricante"
          value={formData.fabricante}
          onChange={(e) => onChange("fabricante", e.target.value)}
          placeholder="Ex: Dimep, Sweda, Bematech"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="modelo">Modelo</Label>
        <Input
          id="modelo"
          value={formData.modelo}
          onChange={(e) => onChange("modelo", e.target.value)}
          placeholder="Ex: D-SAT 2.0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="versao_software">Versão do Software</Label>
        <Input
          id="versao_software"
          value={formData.versao_software}
          onChange={(e) => onChange("versao_software", e.target.value)}
          placeholder="Ex: 1.0.0"
        />
      </div>
    </>
  );
}
