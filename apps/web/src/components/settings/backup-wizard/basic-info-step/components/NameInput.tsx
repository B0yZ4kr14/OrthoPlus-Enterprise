import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="backup-name">Nome do Backup</Label>
      <Input
        id="backup-name"
        placeholder="Ex: Backup Diário Completo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
