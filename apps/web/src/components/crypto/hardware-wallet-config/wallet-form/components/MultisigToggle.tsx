import { Label } from "@orthoplus/core-ui/label";

interface MultisigToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function MultisigToggle({ checked, onChange }: MultisigToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="multisig"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border"
      />
      <Label htmlFor="multisig" className="cursor-pointer">
        Configurar Multi-Assinatura (2-of-3 ou superior)
      </Label>
    </div>
  );
}
