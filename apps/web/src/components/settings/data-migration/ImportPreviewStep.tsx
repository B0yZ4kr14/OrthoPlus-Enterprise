import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";

interface ImportPreviewData {
  version?: string;
  exportedAt?: string;
  data?: {
    modules?: { length: number };
    patients?: unknown;
    patientCount?: number;
    prontuarios?: { length: number };
    appointments?: { length: number };
  };
}

interface ImportPreviewStepProps {
  importData: unknown;
}

export function ImportPreviewStep({ importData }: ImportPreviewStepProps) {
  const data = importData as ImportPreviewData | null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Preview dos Dados</h3>

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Versão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data.version ?? "—"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Data de Exportação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {data.exportedAt
                    ? new Date(data.exportedAt).toLocaleString("pt-BR")
                    : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conteúdo do Arquivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.data?.modules && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Módulos</span>
                  <Badge>{data.data.modules.length} registros</Badge>
                </div>
              )}
              {data.data?.patients != null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pacientes</span>
                  <Badge>{data.data.patientCount ?? 0} registros</Badge>
                </div>
              )}
              {data.data?.prontuarios && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prontuários</span>
                  <Badge>{data.data.prontuarios.length} registros</Badge>
                </div>
              )}
              {data.data?.appointments && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Agendamentos</span>
                  <Badge>{data.data.appointments.length} registros</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
