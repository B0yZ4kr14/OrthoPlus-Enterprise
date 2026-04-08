import React from "react";
import { Cloud } from "lucide-react";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { WizardStepProps, ScheduledBackupConfig } from "./types";

export function DestinationStep({ config, setConfig }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Destino do Backup</h3>
      </div>

      <div className="space-y-2">
        <Label>Onde deseja armazenar o backup?</Label>
        <Select
          value={config.cloudStorageProvider}
          onValueChange={(value: ScheduledBackupConfig["cloudStorageProvider"]) =>
            setConfig({ ...config, cloudStorageProvider: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Armazenamento Local</SelectItem>
            <SelectItem value="s3">Amazon S3</SelectItem>
            <SelectItem value="google_drive">Google Drive</SelectItem>
            <SelectItem value="dropbox">Dropbox</SelectItem>
            <SelectItem value="ftp">FTP/SFTP</SelectItem>
            <SelectItem value="storj">Storj DCS (Descentralizado)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.cloudStorageProvider === "local" && (
        <div className="space-y-2">
          <Label>Caminho Local</Label>
          <Input
            placeholder="/var/backups/orthoplus"
            value={config.localPath || ""}
            onChange={(e) =>
              setConfig({ ...config, localPath: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Caminho no servidor onde os backups serão salvos
          </p>
        </div>
      )}

      {config.cloudStorageProvider === "ftp" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Servidor FTP/SFTP</Label>
            <Input
              placeholder="ftp.example.com"
              value={config.ftpConfig?.host || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ftpConfig: {
                    ...config.ftpConfig!,
                    host: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Porta</Label>
            <Input
              type="number"
              placeholder="21"
              value={config.ftpConfig?.port || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ftpConfig: {
                    ...config.ftpConfig!,
                    port: parseInt(e.target.value),
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Input
              placeholder="username"
              value={config.ftpConfig?.username || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ftpConfig: {
                    ...config.ftpConfig!,
                    username: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              type="password"
              value={config.ftpConfig?.password || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ftpConfig: {
                    ...config.ftpConfig!,
                    password: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Caminho Remoto</Label>
            <Input
              placeholder="/backups"
              value={config.ftpConfig?.remotePath || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  ftpConfig: {
                    ...config.ftpConfig!,
                    remotePath: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {config.cloudStorageProvider === "storj" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Access Grant</Label>
            <Input
              placeholder="Seu access grant do Storj DCS"
              value={config.storjConfig?.accessGrant || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  storjConfig: {
                    ...config.storjConfig!,
                    accessGrant: e.target.value,
                  },
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Obtenha seu access grant em:{" "}
              <a
                href="https://storj.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                storj.io
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <Label>Bucket</Label>
            <Input
              placeholder="orthoplus-backups"
              value={config.storjConfig?.bucket || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  storjConfig: {
                    ...config.storjConfig!,
                    bucket: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Prefixo (opcional)</Label>
            <Input
              placeholder="clinic-name/"
              value={config.storjConfig?.prefix || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  storjConfig: {
                    ...config.storjConfig!,
                    prefix: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      <div className="space-y-2 mt-4">
        <Label>E-mails para Notificação (opcional)</Label>
        <Input
          placeholder="admin@example.com, backup@example.com"
          value={config.notificationEmails.join(", ")}
          onChange={(e) =>
            setConfig({
              ...config,
              notificationEmails: e.target.value
                .split(",")
                .map((em) => em.trim())
                .filter(Boolean),
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          Separe múltiplos e-mails com vírgula
        </p>
      </div>
    </div>
  );
}
