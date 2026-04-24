// cspell:disable
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Switch } from "@orthoplus/core-ui/switch";
import type { EmailPasswordSectionProps } from "./types";
import { MainToggle } from "./components/MainToggle";

export * from "./types";
export { MainToggle };

export function EmailPasswordSection({ config, onUpdate }: EmailPasswordSectionProps) {
  return (
    <div className="space-y-4">
      <MainToggle
        enabled={config.email_password_enabled || false}
        onEnabledChange={(checked) =>
          onUpdate({ email_password_enabled: checked })
        }
      />

      {config.email_password_enabled && (
        <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-confirmar Email</Label>
              <p className="text-sm text-muted-foreground">
                Não exigir confirmação de email (recomendado para testes)
              </p>
            </div>
            <Switch
              checked={config.auto_confirm_email || false}
              onCheckedChange={(checked) =>
                onUpdate({ auto_confirm_email: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-length">Tamanho Mínimo da Senha</Label>
            <Input
              id="min-length"
              type="number"
              min={6}
              max={32}
              value={config.password_min_length || 8}
              onChange={(e) =>
                onUpdate({ password_min_length: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="space-y-3">
            <Label>Requisitos de Senha</Label>

            <div className="flex items-center justify-between">
              <Label className="font-normal">Exigir letra maiúscula</Label>
              <Switch
                checked={config.require_uppercase || false}
                onCheckedChange={(checked) =>
                  onUpdate({ require_uppercase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-normal">Exigir número</Label>
              <Switch
                checked={config.require_number || false}
                onCheckedChange={(checked) =>
                  onUpdate({ require_number: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="font-normal">Exigir caractere especial (!@#$%)</Label>
              <Switch
                checked={config.require_special_char || false}
                onCheckedChange={(checked) =>
                  onUpdate({ require_special_char: checked })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
