// cspell:disable
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";

interface PercentualInputsProps {
  percentualDentista: number;
  percentualClinica: number;
  onDentistaChange: (value: number) => void;
}

export function PercentualInputs({
  percentualDentista,
  percentualClinica,
  onDentistaChange,
}: PercentualInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="percentual_dentista">Percentual Dentista (%) *</Label>
        <Input
          id="percentual_dentista"
          type="number"
          min="0"
          max="100"
          value={percentualDentista}
          onChange={(e) => onDentistaChange(Number(e.target.value))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="percentual_clinica">Percentual Clínica (%) *</Label>
        <Input
          id="percentual_clinica"
          type="number"
          min="0"
          max="100"
          value={percentualClinica}
          disabled
          className="bg-muted"
        />
      </div>
    </div>
  );
}
