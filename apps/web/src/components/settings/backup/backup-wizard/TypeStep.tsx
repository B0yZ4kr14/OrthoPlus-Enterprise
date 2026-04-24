import { Label } from "@orthoplus/core-ui/label";
import { RadioGroup, RadioGroupItem } from "@orthoplus/core-ui/radio-group";
import type { BackupType } from "./types";

interface TypeStepProps {
  value: BackupType;
  onChange: (type: BackupType) => void;
}

const TYPE_OPTIONS = [
  {
    value: "full" as const,
    label: "Backup Completo (Full)",
    description: "Cópia completa de todos os dados selecionados",
  },
  {
    value: "incremental" as const,
    label: "Backup Incremental",
    description: "Apenas dados modificados desde o último backup",
  },
  {
    value: "differential" as const,
    label: "Backup Diferencial",
    description: "Dados modificados desde o último backup completo",
  },
];

export function TypeStep({ value, onChange }: TypeStepProps) {
  return (
    <div className="space-y-4 py-4">
      <Label>Tipo de Backup</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as BackupType)}>
        {TYPE_OPTIONS.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent"
          >
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value} className="flex-1 cursor-pointer">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground">
                {option.description}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
