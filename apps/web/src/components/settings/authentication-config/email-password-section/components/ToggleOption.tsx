import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";

interface ToggleOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ToggleOption({ label, description, checked, onCheckedChange }: ToggleOptionProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
