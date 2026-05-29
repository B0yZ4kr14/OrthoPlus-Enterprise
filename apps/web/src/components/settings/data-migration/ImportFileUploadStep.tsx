import React from "react";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Button } from "@orthoplus/core-ui/button";
import { Label } from "@orthoplus/core-ui/label";
import { Upload } from "lucide-react";
import type { ImportStepProps } from "./types";

export function ImportFileUploadStep({
  importFile,
  onFileUpload,
}: Pick<ImportStepProps, "importFile" | "onFileUpload">) {
  return (
    <div className="space-y-6">
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          Selecione um arquivo de exportação do OrthoPlus Enterprise (formato
          JSON) para importar os dados.
        </AlertDescription>
      </Alert>

      <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h4 className="font-medium mb-2">
            Selecione o arquivo de importação
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Apenas arquivos .json gerados pelo OrthoPlus Enterprise
          </p>
          <input
            type="file"
            accept=".json"
            onChange={onFileUpload}
            className="hidden"
            id="import-file"
            title="Selecione o arquivo JSON para importação"
          />
          <Label htmlFor="import-file">
            <Button variant="outline" asChild>
              <span>Selecionar Arquivo</span>
            </Button>
          </Label>
        </div>
        {importFile && (
          <div className="text-sm text-muted-foreground">
            Arquivo selecionado: <strong>{importFile.name}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
