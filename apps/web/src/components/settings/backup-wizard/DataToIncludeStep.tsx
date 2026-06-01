import React from "react";
import { Database } from "lucide-react";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Label } from "@orthoplus/core-ui/label";
import { WizardStepProps, ScheduledBackupConfig } from "./types";

export function DataToIncludeStep({ config, setConfig }: WizardStepProps) {
  const items: { key: keyof ScheduledBackupConfig; label: string }[] = [
    { key: "includeModules", label: "Configurações de Módulos" },
    { key: "includePatients", label: "Dados de Pacientes" },
    { key: "includeHistory", label: "Histórico Clínico" },
    { key: "includeProntuarios", label: "Prontuários Completos" },
    { key: "includeAppointments", label: "Agendamentos" },
    { key: "includeFinanceiro", label: "Dados Financeiros" },
    {
      key: "includePostgresDB",
      label: "Banco de Dados PostgreSQL (dump completo)",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Dados a Incluir</h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center space-x-2">
            <Checkbox
              id={`backup-${item.key}`}
              checked={config[item.key] as boolean}
              onCheckedChange={(checked) =>
                setConfig({ ...config, [item.key]: checked })
              }
            />
            <Label htmlFor={`backup-${item.key}`}>{item.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}
