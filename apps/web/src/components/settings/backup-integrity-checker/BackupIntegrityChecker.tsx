import { Button } from "@orthoplus/core-ui/button";
import { Card } from "@orthoplus/core-ui/card";
import { Shield } from "lucide-react";
import type { BackupIntegrityCheckerProps } from "./types";
import { useIntegrityChecker } from "./useIntegrityChecker";
import { BackupSelect } from "./BackupSelect";
import { ValidateButton } from "./ValidateButton";
import { ResultDisplay } from "./ResultDisplay";

export function BackupIntegrityChecker({
  isOpen,
  onClose,
}: BackupIntegrityCheckerProps) {
  const {
    loading,
    selectedBackupId,
    result,
    backups,
    setSelectedBackupId,
    loadBackups,
    checkIntegrity,
  } = useIntegrityChecker();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Validação de Integridade</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <BackupSelect
            backups={backups}
            value={selectedBackupId}
            onChange={setSelectedBackupId}
            onFocus={loadBackups}
          />

          <ValidateButton
            disabled={!selectedBackupId}
            loading={loading}
            onClick={checkIntegrity}
          />

          {result && <ResultDisplay result={result} />}
        </div>
      </Card>
    </div>
  );
}
