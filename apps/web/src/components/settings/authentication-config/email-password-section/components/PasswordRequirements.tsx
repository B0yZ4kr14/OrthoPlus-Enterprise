import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Switch } from "@orthoplus/core-ui/switch";

interface PasswordRequirementsProps {
  minLength: number;
  onMinLengthChange: (value: number) => void;
  requireUppercase: boolean;
  onRequireUppercaseChange: (checked: boolean) => void;
  requireNumber: boolean;
  onRequireNumberChange: (checked: boolean) => void;
  requireSpecialChar: boolean;
  onRequireSpecialCharChange: (checked: boolean) => void;
}

export function PasswordRequirements({
  minLength,
  onMinLengthChange,
  requireUppercase,
  onRequireUppercaseChange,
  requireNumber,
  onRequireNumberChange,
  requireSpecialChar,
  onRequireSpecialCharChange,
}: PasswordRequirementsProps) {
  return (
    <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Auto-confirmar Email</Label>
          <p className="text-sm text-muted-foreground">
            Não exigir confirmação de email (recomendado para testes)
          </p>
        </div>
        <Switch
          checked={false}
          onCheckedChange={() => {
            /* no-op: controlled by parent */
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="min-length">Tamanho Mínimo da Senha</Label>
        <Input
          id="min-length"
          type="number"
          min={6}
          max={32}
          value={minLength}
          onChange={(e) => onMinLengthChange(parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-3">
        <Label>Requisitos de Senha</Label>

        <div className="flex items-center justify-between">
          <Label className="font-normal">Exigir letra maiúscula</Label>
          <Switch
            checked={requireUppercase}
            onCheckedChange={onRequireUppercaseChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="font-normal">Exigir número</Label>
          <Switch
            checked={requireNumber}
            onCheckedChange={onRequireNumberChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="font-normal">
            Exigir caractere especial (!@#$%)
          </Label>
          <Switch
            checked={requireSpecialChar}
            onCheckedChange={onRequireSpecialCharChange}
          />
        </div>
      </div>
    </div>
  );
}
