// cspell:disable
import { Switch } from "@orthoplus/core-ui/switch";
import { Label } from "@orthoplus/core-ui/label";

interface AtivoSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AtivoSwitch({ checked, onChange }: AtivoSwitchProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="ativo" checked={checked} onCheckedChange={onChange} />
      <Label htmlFor="ativo">Configuração Ativa</Label>
    </div>
  );
}
