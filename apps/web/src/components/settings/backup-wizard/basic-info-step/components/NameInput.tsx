import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="space-y-2">
      <Label>Nome do Backup</Label>
      <Input
        placeholder="Ex: Backup Diário Completo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
