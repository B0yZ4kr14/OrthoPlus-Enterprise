import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";

interface AutoSyncToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AutoSyncToggle({ checked, onChange }: AutoSyncToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>Sincronização Automática</Label>
        <p className="text-sm text-muted-foreground">
          Enviar commits automaticamente após mudanças
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
