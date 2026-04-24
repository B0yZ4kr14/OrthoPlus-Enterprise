import { Database } from "lucide-react";
import type { WizardStepProps } from "./types";
import { BACKUP_OPTIONS } from "./constants/options";
import { BackupTypeCard } from "./components/BackupTypeCard";

export * from "./types";
export { BACKUP_OPTIONS, BackupTypeCard };

export function BackupTypeStep({ config, setConfig }: WizardStepProps) {
  const handleTypeChange = (
    type: "full" | "incremental" | "differential",
    isIncremental?: boolean
  ) => {
    setConfig({
      ...config,
      backupType: type,
      isIncremental: isIncremental ?? config.isIncremental,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Tipo de Backup</h3>
      </div>

      <div className="space-y-3">
        {BACKUP_OPTIONS.map((option) => (
          <BackupTypeCard
            key={option.value}
            type={option.value}
            title={option.title}
            description={option.description}
            isSelected={config.backupType === option.value}
            onClick={() => handleTypeChange(option.value, option.isIncremental)}
          />
        ))}
      </div>
    </div>
  );
}
