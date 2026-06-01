import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import { Switch } from "@orthoplus/core-ui/switch";
import { Settings } from "lucide-react";

interface RetentionConfigCardProps {
  retentionDays: number;
  autoCleanup: boolean;
  onRetentionChange: (value: number) => void;
  onAutoCleanupChange: (value: boolean) => void;
  onSave: () => void;
  isPending: boolean;
}

export function RetentionConfigCard({
  retentionDays,
  autoCleanup,
  onRetentionChange,
  onAutoCleanupChange,
  onSave,
  isPending,
}: RetentionConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração de Retenção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="retention">Período de Retenção (dias)</Label>
          <Input
            id="retention"
            type="number"
            min="7"
            max="365"
            value={retentionDays}
            onChange={(e) => onRetentionChange(parseInt(e.target.value))}
          />
          <p className="text-sm text-muted-foreground">
            Backups mais antigos que {retentionDays} dias serão automaticamente
            removidos.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="retention-auto-cleanup">Limpeza Automática</Label>
            <p className="text-sm text-muted-foreground">
              Ativar remoção automática de backups antigos
            </p>
          </div>
          <Switch id="retention-auto-cleanup" checked={autoCleanup} onCheckedChange={onAutoCleanupChange} />
        </div>

        <Button onClick={onSave} disabled={isPending}>
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}
