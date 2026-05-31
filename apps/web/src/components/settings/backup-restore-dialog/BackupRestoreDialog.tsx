/**
 * BackupRestoreDialog - Componente Orquestrador (Refatorado)
 *
 * ANTES: 520 linhas
 * DEPOIS: ~90 linhas + estrutura modular
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { AlertTriangle } from "lucide-react";
import { useBackupRestore } from "./useBackupRestore";
import { StepIndicator } from "./StepIndicator";
import { BackupValidation } from "./BackupValidation";
import { ItemSelection } from "./ItemSelection";
import { RestoreProgress } from "./RestoreProgress";
import type { BackupRestoreDialogProps } from "./types";

export function BackupRestoreDialog({
  open,
  onClose,
  backupFile,
}: BackupRestoreDialogProps) {
  const {
    step,
    loading,
    backupData,
    decryptionPassword,
    requiresDecryption,
    progress,
    selectedItems,
    results,
    error,
    setStep,
    setDecryptionPassword,
    toggleItem,
    handleRestore,
    handleClose,
  } = useBackupRestore(open, onClose, backupFile);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <BackupValidation
            requiresDecryption={requiresDecryption}
            decryptionPassword={decryptionPassword}
            onPasswordChange={setDecryptionPassword}
            onDecrypt={() => {
              /* no-op: hook handles decryption internally */
            }} // Hook gerencia internamente
            loading={loading}
            error={error}
          />
        );
      case 2:
        return backupData ? (
          <ItemSelection
            backupData={backupData}
            selectedItems={selectedItems}
            onToggleItem={toggleItem}
          />
        ) : null;
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Confirmação</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Você está prestes a restaurar{" "}
              {Object.values(selectedItems).filter(Boolean).length} tipos de
              dados. Esta ação não pode ser desfeita.
            </p>
          </div>
        );
      case 4:
        return <RestoreProgress progress={progress} results={results} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Restaurar Backup</DialogTitle>
          <DialogDescription>
            Restaure os dados do sistema a partir de um arquivo de backup
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={step} />

        <div className="py-4">{renderStepContent()}</div>

        <div className="flex justify-between">
          {step > 1 && step < 4 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Voltar
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose}>
              {step === 4 && results ? "Fechar" : "Cancelar"}
            </Button>

            {step === 2 && (
              <Button
                onClick={() => setStep(3)}
                disabled={!Object.values(selectedItems).some(Boolean)}
              >
                Continuar
              </Button>
            )}

            {step === 3 && (
              <Button onClick={handleRestore} disabled={loading}>
                Restaurar Dados
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
