import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import type { ScheduledBackupConfig } from "../types";

interface FTPConfigFormProps {
  config: ScheduledBackupConfig["ftpConfig"];
  onChange: (config: ScheduledBackupConfig["ftpConfig"]) => void;
}

export function FTPConfigForm({ config, onChange }: FTPConfigFormProps) {
  const updateField = (
    field: keyof NonNullable<typeof config>,
    value: string | number,
  ) => {
    onChange({
      ...config,
      [field]: value,
    } as ScheduledBackupConfig["ftpConfig"]);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="ftp-host">Servidor FTP/SFTP</Label>
        <Input
          id="ftp-host"
          placeholder="ftp.example.com"
          value={config?.host || ""}
          onChange={(e) => updateField("host", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ftp-port">Porta</Label>
        <Input
          id="ftp-port"
          type="number"
          placeholder="21"
          value={config?.port || ""}
          onChange={(e) => updateField("port", parseInt(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ftp-user">Usuário</Label>
        <Input
          id="ftp-user"
          placeholder="username"
          value={config?.username || ""}
          onChange={(e) => updateField("username", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ftp-password">Senha</Label>
        <Input
          id="ftp-password"
          type="password"
          value={config?.password || ""}
          onChange={(e) => updateField("password", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ftp-remote-path">Caminho Remoto</Label>
        <Input
          id="ftp-remote-path"
          placeholder="/backups"
          value={config?.remotePath || ""}
          onChange={(e) => updateField("remotePath", e.target.value)}
        />
      </div>
    </div>
  );
}
