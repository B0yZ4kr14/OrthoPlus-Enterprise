import { Switch } from "@orthoplus/core-ui/switch";
import { Label } from "@orthoplus/core-ui/label";

interface SharingToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SharingToggle({ checked, onChange }: SharingToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="compartilhavel"
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor="compartilhavel">
        Permitir Compartilhamento em Redes Sociais
      </Label>
    </div>
  );
}
