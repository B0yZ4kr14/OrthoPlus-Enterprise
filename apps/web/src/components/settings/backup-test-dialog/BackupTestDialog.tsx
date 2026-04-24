// cspell:disable
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Info, CheckCircle2, Loader2 } from "lucide-react";
import { useBackupTest } from "./useBackupTest";
import { StatusIcon } from "./StatusIcon";
import { ProgressSection } from "./ProgressSection";
import { TestResultView } from "./TestResultView";
import type { BackupTestDialogProps } from "./types";

export function BackupTestDialog({ open, onOpenChange, backupId, backupName }: BackupTestDialogProps) {
  const { testing, testResult, progress, runTest } = useBackupTest(backupId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusIcon testing={testing} testResult={testResult} />
            Teste de Restauração de Backup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Este teste valida a integridade e restaurabilidade do backup sem aplicar mudanças reais. Ideal para
              garantir que seus backups estão funcionando corretamente.
            </AlertDescription>
          </Alert>

          {backupName && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Backup selecionado:</p>
              <p className="text-sm text-muted-foreground">{backupName}</p>
            </div>
          )}

          {testing && <ProgressSection progress={progress} />}
          {testResult && <TestResultView testResult={testResult} />}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={runTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {testResult ? "Executar Novamente" : "Iniciar Teste"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
