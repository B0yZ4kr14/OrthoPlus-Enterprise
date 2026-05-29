// cspell:disable
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { FileText } from "lucide-react";
import { useBackupDiff } from "./useBackupDiff";
import { BackupSelector } from "./BackupSelector";
import { DiffTabs } from "./DiffTabs";
import type { BackupDiffViewerProps } from "./types";

export function BackupDiffViewer({
  open,
  onOpenChange,
}: BackupDiffViewerProps) {
  const {
    backup1,
    backup2,
    backups,
    diffResult,
    setBackup1,
    setBackup2,
    compareMutation,
    getTotalChanges,
  } = useBackupDiff(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Comparar Backups Incrementais</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BackupSelector
              label="Backup Mais Antigo"
              value={backup1}
              backups={backups}
              onChange={setBackup1}
            />
            <BackupSelector
              label="Backup Mais Recente"
              value={backup2}
              backups={backups}
              onChange={setBackup2}
            />
          </div>

          <Button
            onClick={compareMutation}
            disabled={!backup1 || !backup2}
            className="w-full gap-2"
          >
            <FileText className="h-4 w-4" />
            Comparar Backups
          </Button>

          {diffResult && (
            <DiffTabs
              diffResult={diffResult}
              getTotalChanges={getTotalChanges}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
