import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Badge } from "@orthoplus/core-ui/badge";
import { Progress } from "@orthoplus/core-ui/progress";
import { FileJson } from "lucide-react";
import type { ExportStepProps } from "./types";

export function ExportConfirmStep({
  exportOptions,
  loading,
  progress,
}: ExportStepProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <FileJson className="h-4 w-4" />
        <AlertDescription>
          Confirme os dados selecionados para exportação. O processo pode levar
          alguns minutos dependendo do volume de dados.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <h4 className="font-semibold">Dados Selecionados:</h4>
        <div className="space-y-1">
          {exportOptions.includeModules && (
            <Badge variant="secondary">Módulos</Badge>
          )}
          {exportOptions.includePatients && (
            <Badge variant="secondary">Pacientes</Badge>
          )}
          {exportOptions.includeProntuarios && (
            <Badge variant="secondary">Prontuários</Badge>
          )}
          {exportOptions.includeHistory && (
            <Badge variant="secondary">Histórico Clínico</Badge>
          )}
          {exportOptions.includeAppointments && (
            <Badge variant="secondary">Agendamentos</Badge>
          )}
          {exportOptions.includeFinanceiro && (
            <Badge variant="secondary">Financeiro</Badge>
          )}
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            Exportando dados... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
