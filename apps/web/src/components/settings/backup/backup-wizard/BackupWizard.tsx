import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import type { BackupWizardProps } from "./types";
import { useBackupWizard } from "./useBackupWizard";
import { TypeStep } from "./TypeStep";
import { DataStep } from "./DataStep";
import { OptionsStep } from "./OptionsStep";

export function BackupWizard({ open, onOpenChange }: BackupWizardProps) {
  const {
    step,
    config,
    setBackupType,
    toggleDataCategory,
    setCompression,
    setEncryption,
    nextStep,
    prevStep,
    confirm,
  } = useBackupWizard(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Backup - Etapa {step} de 3</DialogTitle>
        </DialogHeader>

        {step === 1 && <TypeStep value={config.type} onChange={setBackupType} />}

        {step === 2 && (
          <DataStep selectedData={config.selectedData} onToggle={toggleDataCategory} />
        )}

        {step === 3 && (
          <OptionsStep
            config={config}
            onCompressionChange={setCompression}
            onEncryptionChange={setEncryption}
          />
        )}

        <DialogFooter>
          {step > 1 && <Button variant="outline" onClick={prevStep}>Voltar</Button>}
          {step < 3 ? (
            <Button onClick={nextStep}>Próximo</Button>
          ) : (
            <Button onClick={confirm}>Confirmar Backup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
