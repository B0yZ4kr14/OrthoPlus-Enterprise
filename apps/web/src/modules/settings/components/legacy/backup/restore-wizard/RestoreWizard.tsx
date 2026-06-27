import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import type { RestoreWizardProps } from "./types";
import { useRestoreWizard } from "./useRestoreWizard";
import { BackupSelect } from "./BackupSelect";
import { PreviewStep } from "./PreviewStep";
import { ConfirmStep } from "./ConfirmStep";

export function RestoreWizard({ open, onOpenChange }: RestoreWizardProps) {
  const {
    step,
    selectedBackup,
    selectedBackupData,
    backups,
    setSelectedBackup,
    nextStep,
    prevStep,
    confirm,
  } = useRestoreWizard(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Restaurar Backup - Etapa {step} de 3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <BackupSelect
            backups={backups}
            value={selectedBackup}
            onChange={setSelectedBackup}
          />
        )}

        {step === 2 && selectedBackupData && (
          <PreviewStep backup={selectedBackupData} />
        )}

        {step === 3 && selectedBackupData && (
          <ConfirmStep backupDate={selectedBackupData.date} />
        )}

        <DialogFooter>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Voltar
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={nextStep} disabled={step === 1 && !selectedBackup}>
              Próximo
            </Button>
          ) : (
            <Button type="button" variant="destructive" onClick={confirm}>
              Confirmar Restauração
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
