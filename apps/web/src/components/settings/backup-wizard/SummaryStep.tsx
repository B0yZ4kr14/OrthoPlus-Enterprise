import React from "react";
import { Check } from "lucide-react";
import { Badge } from "@orthoplus/core-ui/badge";
import { Card } from "@orthoplus/core-ui/card";
import { WizardStepProps } from "./types";

export interface SummaryStepProps extends WizardStepProps {
  nextExecutions: string[];
}

export function SummaryStep({ config, nextExecutions }: SummaryStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Check className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Resumo da Configuração</h3>
      </div>

      <Card className="p-4 space-y-2">
        <div>
          <span className="font-medium">Nome:</span> {config.name}
        </div>
        <div>
          <span className="font-medium">Frequência:</span>{" "}
          {config.frequency === "daily" && "Diário"}
          {config.frequency === "weekly" && "Semanal"}
          {config.frequency === "monthly" && "Mensal"}
          {" às "}
          {config.timeOfDay}
        </div>
        <div>
          <span className="font-medium">Tipo:</span>{" "}
          {config.backupType === "full" && "Completo (Full)"}
          {config.backupType === "incremental" && "Incremental"}
          {config.backupType === "differential" && "Diferencial"}
        </div>
        <div>
          <span className="font-medium">Compressão:</span>{" "}
          {config.enableCompression ? "Sim" : "Não"}
        </div>
        <div>
          <span className="font-medium">Criptografia:</span>{" "}
          {config.enableEncryption ? "Sim (AES-256-GCM)" : "Não"}
        </div>
        <div>
          <span className="font-medium">Destino:</span>{" "}
          {config.cloudStorageProvider === "local" && "Armazenamento Local"}
          {config.cloudStorageProvider === "s3" && "Amazon S3"}
          {config.cloudStorageProvider === "google_drive" && "Google Drive"}
          {config.cloudStorageProvider === "dropbox" && "Dropbox"}
          {config.cloudStorageProvider === "ftp" && "FTP/SFTP"}
          {config.cloudStorageProvider === "storj" && "Storj DCS"}
        </div>
      </Card>

      <div>
        <h4 className="font-medium mb-2">Próximas 5 Execuções:</h4>
        <div className="space-y-1">
          {nextExecutions.map((date, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{i + 1}</Badge>
              <span>{date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
