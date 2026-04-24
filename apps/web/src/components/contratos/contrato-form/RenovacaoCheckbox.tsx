import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Label } from "@orthoplus/core-ui/label";

interface RenovacaoCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RenovacaoCheckbox({ checked, onChange }: RenovacaoCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="renovacao_automatica"
        checked={checked}
        onCheckedChange={(checked) => onChange(checked as boolean)}
      />
      <Label htmlFor="renovacao_automatica" className="cursor-pointer">
        Renovação Automática
      </Label>
    </div>
  );
}
