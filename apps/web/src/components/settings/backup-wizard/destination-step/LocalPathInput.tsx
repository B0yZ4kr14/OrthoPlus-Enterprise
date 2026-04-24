import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";

interface LocalPathInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocalPathInput({ value, onChange }: LocalPathInputProps) {
  return (
    <div className="space-y-2">
      <Label>Caminho Local</Label>
      <Input
        placeholder="/var/backups/orthoplus"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Caminho no servidor onde os backups serão salvos
      </p>
    </div>
  );
}
