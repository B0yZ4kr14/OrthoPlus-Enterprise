import { Label } from "@orthoplus/core-ui/label";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Database, FileText, Users, Calendar, Package } from "lucide-react";
import type { DataCategory, DataOption } from "./types";

interface DataStepProps {
  selectedData: DataCategory[];
  onToggle: (category: DataCategory) => void;
}

const DATA_OPTIONS: DataOption[] = [
  { id: "patients", label: "Pacientes", icon: Users },
  { id: "appointments", label: "Agenda", icon: Calendar },
  { id: "records", label: "Prontuários", icon: FileText },
  { id: "financial", label: "Financeiro", icon: Database },
  { id: "inventory", label: "Estoque", icon: Package },
];

export function DataStep({ selectedData, onToggle }: DataStepProps) {
  return (
    <div className="space-y-4 py-4">
      <Label>Selecione os Dados</Label>
      <div className="grid grid-cols-2 gap-4">
        {DATA_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedData.includes(option.id);

          return (
            <div
              key={option.id}
              className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent"
              onClick={() => onToggle(option.id)}
            >
              <Checkbox id={`data-${option.id}`} checked={isSelected} />
              <Icon className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor={`data-${option.id}`} className="flex-1 cursor-pointer font-medium">
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
