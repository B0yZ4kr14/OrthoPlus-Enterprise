// cspell:disable
import { Switch } from "@orthoplus/core-ui/switch";
import { Label } from "@orthoplus/core-ui/label";

interface AtivoSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function AtivoSwitch({ value, onChange }: AtivoSwitchProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="ativo" checked={value} onCheckedChange={onChange} />
      <Label htmlFor="ativo">Ativo</Label>
    </div>
  );
}
