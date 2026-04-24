import { Cloud } from "lucide-react";
import type { DestinationStepProps } from "./types";
import { StorageProviderSelect } from "./StorageProviderSelect";
import { LocalPathInput } from "./LocalPathInput";
import { FTPConfigForm } from "./FTPConfigForm";
import { StorjConfigForm } from "./StorjConfigForm";
import { NotificationEmailsInput } from "./NotificationEmailsInput";

export function DestinationStep({ config, setConfig }: DestinationStepProps) {
  const updateProvider = (provider: typeof config.cloudStorageProvider) => {
    setConfig({ ...config, cloudStorageProvider: provider });
  };

  const updateLocalPath = (path: string) => {
    setConfig({ ...config, localPath: path });
  };

  const updateFTPConfig = (ftpConfig: typeof config.ftpConfig) => {
    setConfig({ ...config, ftpConfig });
  };

  const updateStorjConfig = (storjConfig: typeof config.storjConfig) => {
    setConfig({ ...config, storjConfig });
  };

  const updateEmails = (emails: string[]) => {
    setConfig({ ...config, notificationEmails: emails });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Destino do Backup</h3>
      </div>

      <StorageProviderSelect
        value={config.cloudStorageProvider}
        onChange={updateProvider}
      />

      {config.cloudStorageProvider === "local" && (
        <LocalPathInput value={config.localPath || ""} onChange={updateLocalPath} />
      )}

      {config.cloudStorageProvider === "ftp" && (
        <FTPConfigForm config={config.ftpConfig} onChange={updateFTPConfig} />
      )}

      {config.cloudStorageProvider === "storj" && (
        <StorjConfigForm config={config.storjConfig} onChange={updateStorjConfig} />
      )}

      <div className="mt-4">
        <NotificationEmailsInput
          emails={config.notificationEmails}
          onChange={updateEmails}
        />
      </div>
    </div>
  );
}
