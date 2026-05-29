import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Separator } from "@orthoplus/core-ui/separator";
import { CheckCircle2 } from "lucide-react";
import type { ResultsStepProps } from "./types";

interface ImportResultsData {
  imported: {
    modules: number;
    patients: number;
    prontuarios: number;
    appointments: number;
  };
  skipped?: unknown[];
  errors?: unknown[];
}

export function MigrationResultsStep({
  mode,
  importResults,
}: ResultsStepProps) {
  if (mode === "export") {
    return (
      <div className="space-y-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
        <div>
          <h3 className="text-xl font-semibold mb-2">Exportação Concluída!</h3>
          <p className="text-muted-foreground">
            Os dados foram exportados com sucesso. O arquivo foi baixado para
            seu computador.
          </p>
        </div>
      </div>
    );
  }

  const results = importResults as ImportResultsData | null;

  if (results) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Importação Concluída!</h3>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo da Importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Módulos importados:</span>
              <Badge variant="secondary">{results.imported.modules}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Pacientes importados:</span>
              <Badge variant="secondary">{results.imported.patients}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Prontuários importados:</span>
              <Badge variant="secondary">{results.imported.prontuarios}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Agendamentos importados:</span>
              <Badge variant="secondary">{results.imported.appointments}</Badge>
            </div>

            {(results.skipped?.length ?? 0) > 0 && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm">Registros ignorados:</span>
                  <Badge variant="secondary">{results.skipped?.length}</Badge>
                </div>
              </>
            )}

            {(results.errors?.length ?? 0) > 0 && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-destructive">Erros:</span>
                  <Badge variant="destructive">{results.errors?.length}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
