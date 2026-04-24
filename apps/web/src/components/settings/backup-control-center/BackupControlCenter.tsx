import { useState } from "react";
import { BackupWizard } from "../backup/BackupWizard";
import { RestoreWizard } from "../backup/RestoreWizard";
import { BackupSettingsTab } from "../backup/BackupSettingsTab";
import { BackupHistoryTab } from "../backup/BackupHistoryTab";
import { BackupLogsTab } from "../backup/BackupLogsTab";
import { DEFAULT_STATS, DEFAULT_ACTIVITIES } from "./types";
import { ActionButtons } from "./ActionButtons";
import { StatsCards } from "./StatsCards";
import { ActivityCard } from "./ActivityCard";
import { BackupTabs } from "./BackupTabs";

export function BackupControlCenter() {
  const [isBackupWizardOpen, setIsBackupWizardOpen] = useState(false);
  const [isRestoreWizardOpen, setIsRestoreWizardOpen] = useState(false);

  return (
    <div className="space-y-6">
      <ActionButtons
        onBackup={() => setIsBackupWizardOpen(true)}
        onRestore={() => setIsRestoreWizardOpen(true)}
      />

      <StatsCards stats={DEFAULT_STATS} />

      <ActivityCard activities={DEFAULT_ACTIVITIES} />

      <BackupTabs
        settingsTab={<BackupSettingsTab />}
        historyTab={<BackupHistoryTab />}
        logsTab={<BackupLogsTab />}
      />

      <BackupWizard open={isBackupWizardOpen} onOpenChange={setIsBackupWizardOpen} />
      <RestoreWizard open={isRestoreWizardOpen} onOpenChange={setIsRestoreWizardOpen} />
    </div>
  );
}
