import { Mail } from "lucide-react";
import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";

interface MainToggleProps {
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
}

export function MainToggle({ enabled, onEnabledChange }: MainToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <Label htmlFor="auth-email-password">Login com Email/Senha</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Permitir login tradicional com email e senha
        </p>
      </div>
      <Switch id="auth-email-password" checked={enabled} onCheckedChange={onEnabledChange} />
    </div>
  );
}
