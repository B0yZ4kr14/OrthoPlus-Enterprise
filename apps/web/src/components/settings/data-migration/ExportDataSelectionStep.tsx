import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Label } from "@orthoplus/core-ui/label";
import { RadioGroup, RadioGroupItem } from "@orthoplus/core-ui/radio-group";
import { Separator } from "@orthoplus/core-ui/separator";
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  Settings as SettingsIcon,
  Database,
  type LucideIcon,
} from "lucide-react";
import type { ExportStepProps, ExportOptions } from "./types";

export function ExportDataSelectionStep({
  exportOptions,
  setExportOptions,
}: ExportStepProps) {
  const dataItems: {
    id: string;
    key: keyof ExportOptions;
    icon: LucideIcon;
    label: string;
    description: string;
  }[] = [
    {
      id: "modules",
      key: "includeModules",
      icon: SettingsIcon,
      label: "Configurações de Módulos",
      description: "Módulos ativos e suas configurações",
    },
    {
      id: "patients",
      key: "includePatients",
      icon: Users,
      label: "Dados de Pacientes",
      description: "Informações cadastrais dos pacientes",
    },
    {
      id: "prontuarios",
      key: "includeProntuarios",
      icon: FileText,
      label: "Prontuários Eletrônicos (PEP)",
      description: "Prontuários completos e odontogramas",
    },
    {
      id: "history",
      key: "includeHistory",
      icon: Database,
      label: "Histórico Clínico",
      description: "Evolução e anamnese dos pacientes",
    },
    {
      id: "appointments",
      key: "includeAppointments",
      icon: Calendar,
      label: "Agendamentos",
      description: "Consultas agendadas e histórico",
    },
    {
      id: "financeiro",
      key: "includeFinanceiro",
      icon: DollarSign,
      label: "Dados Financeiros",
      description: "Contas a receber e pagar",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Selecione os dados para exportar
        </h3>

        <div className="space-y-3">
          {dataItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={exportOptions[item.key] as boolean}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    [item.key]: checked as boolean,
                  }))
                }
              />
              <Label
                htmlFor={item.id}
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="font-medium">Formato de Exportação</h4>
        <RadioGroup
          value={exportOptions.format}
          onValueChange={(value) =>
            setExportOptions((prev) => ({
              ...prev,
              format: value as ExportOptions["format"],
            }))
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json" className="cursor-pointer">
              JSON Completo (Recomendado)
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
