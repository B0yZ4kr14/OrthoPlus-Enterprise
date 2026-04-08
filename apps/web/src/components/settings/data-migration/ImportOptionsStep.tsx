import React from "react";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Label } from "@orthoplus/core-ui/label";
import { Progress } from "@orthoplus/core-ui/progress";
import { AlertCircle } from "lucide-react";
import type { ImportStepProps } from "./types";

export function ImportOptionsStep({
  importOptions,
  setImportOptions,
  loading,
  progress,
}: Pick<ImportStepProps, "importOptions" | "setImportOptions" | "loading" | "progress">) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Opções de Importação</h3>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Configure como os dados serão importados caso existam conflitos.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 rounded-lg border">
          <Checkbox
            id="skip"
            checked={importOptions.skipConflicts}
            onCheckedChange={(checked) =>
              setImportOptions((prev) => ({
                ...prev,
                skipConflicts: checked as boolean,
              }))
            }
          />
          <Label htmlFor="skip" className="cursor-pointer flex-1">
            <div className="font-medium">Ignorar Conflitos</div>
            <div className="text-xs text-muted-foreground">
              Pular registros que já existem
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border">
          <Checkbox
            id="overwrite"
            checked={importOptions.overwriteExisting}
            onCheckedChange={(checked) =>
              setImportOptions((prev) => ({
                ...prev,
                overwriteExisting: checked as boolean,
              }))
            }
          />
          <Label htmlFor="overwrite" className="cursor-pointer flex-1">
            <div className="font-medium">Sobrescrever Existentes</div>
            <div className="text-xs text-muted-foreground">
              Atualizar registros duplicados
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border">
          <Checkbox
            id="merge"
            checked={importOptions.mergeData}
            onCheckedChange={(checked) =>
              setImportOptions((prev) => ({
                ...prev,
                mergeData: checked as boolean,
              }))
            }
          />
          <Label htmlFor="merge" className="cursor-pointer flex-1">
            <div className="font-medium">Mesclar Dados</div>
            <div className="text-xs text-muted-foreground">
              Combinar dados novos com existentes
            </div>
          </Label>
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            Importando dados... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
