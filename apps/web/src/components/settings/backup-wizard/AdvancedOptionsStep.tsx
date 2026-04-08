import React from "react";
import { Clock } from "lucide-react";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Label } from "@orthoplus/core-ui/label";
import { WizardStepProps } from "./types";

export function AdvancedOptionsStep({ config, setConfig }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Opções Avançadas</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={config.enableCompression}
            onCheckedChange={(checked) =>
              setConfig({
                ...config,
                enableCompression: checked as boolean,
              })
            }
          />
          <Label>
            Compressão Automática (.zip)
            <p className="text-xs text-muted-foreground">
              Reduz o tamanho dos arquivos em até 60%
            </p>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={config.enableEncryption}
            onCheckedChange={(checked) =>
              setConfig({
                ...config,
                enableEncryption: checked as boolean,
              })
            }
          />
          <Label>
            Criptografia AES-256-GCM
            <p className="text-xs text-muted-foreground">
              Protege backups com senha forte (recomendado para dados
              sensíveis)
            </p>
          </Label>
        </div>
      </div>
    </div>
  );
}
