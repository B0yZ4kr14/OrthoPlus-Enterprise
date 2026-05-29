import { Label } from "@orthoplus/core-ui/label";
import { Switch } from "@orthoplus/core-ui/switch";
import { Card } from "@orthoplus/core-ui/card";
import { CheckCircle } from "lucide-react";
import type { BackupConfig } from "./types";
import { BACKUP_TYPE_LABELS } from "./types";

interface OptionsStepProps {
  config: BackupConfig;
  onCompressionChange: (enabled: boolean) => void;
  onEncryptionChange: (enabled: boolean) => void;
}

export function OptionsStep({
  config,
  onCompressionChange,
  onEncryptionChange,
}: OptionsStepProps) {
  return (
    <div className="space-y-6 py-4">
      <Label>Opções Avançadas</Label>

      <div className="flex items-center justify-between border rounded-lg p-4">
        <div className="space-y-0.5">
          <div className="font-medium">Compressão</div>
          <div className="text-sm text-muted-foreground">
            Reduz o tamanho do arquivo de backup
          </div>
        </div>
        <Switch
          checked={config.compression}
          onCheckedChange={onCompressionChange}
        />
      </div>

      <div className="flex items-center justify-between border rounded-lg p-4">
        <div className="space-y-0.5">
          <div className="font-medium">Criptografia</div>
          <div className="text-sm text-muted-foreground">
            Protege os dados com AES-256
          </div>
        </div>
        <Switch
          checked={config.encryption}
          onCheckedChange={onEncryptionChange}
        />
      </div>

      <Card className="p-4 bg-muted">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle className="h-5 w-5 text-primary" />
          Resumo do Backup
        </div>
        <div className="text-sm space-y-1 ml-7 mt-2">
          <p>
            Tipo:{" "}
            <span className="font-medium">
              {BACKUP_TYPE_LABELS[config.type]}
            </span>
          </p>
          <p>
            Dados:{" "}
            <span className="font-medium">
              {config.selectedData.length} categorias
            </span>
          </p>
          <p>
            Compressão:{" "}
            <span className="font-medium">
              {config.compression ? "Ativada" : "Desativada"}
            </span>
          </p>
          <p>
            Criptografia:{" "}
            <span className="font-medium">
              {config.encryption ? "Ativada" : "Desativada"}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
