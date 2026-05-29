import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Label } from "@orthoplus/core-ui/label";
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Database, Users, Calendar, FileText, Lock } from "lucide-react";
import type { BackupData, SelectedItems } from "./types";

interface ItemSelectionProps {
  backupData: BackupData;
  selectedItems: SelectedItems;
  onToggleItem: (key: keyof SelectedItems) => void;
}

const ITEMS_CONFIG = [
  { key: "modules" as const, label: "Módulos", icon: Database },
  { key: "patients" as const, label: "Pacientes", icon: Users },
  {
    key: "historicoClinico" as const,
    label: "Histórico Clínico",
    icon: FileText,
  },
  { key: "prontuarios" as const, label: "Prontuários", icon: FileText },
  { key: "odontogramas" as const, label: "Odontogramas", icon: FileText },
  { key: "appointments" as const, label: "Agendamentos", icon: Calendar },
  { key: "financeiro" as const, label: "Financeiro", icon: Lock },
];

export function ItemSelection({
  backupData,
  selectedItems,
  onToggleItem,
}: ItemSelectionProps) {
  const getItemCount = (key: keyof SelectedItems): number => {
    const data = backupData.data;
    switch (key) {
      case "modules":
        return data.modules?.length || 0;
      case "patients":
        return data.patients?.length || 0;
      case "historicoClinico":
        return data.historicoClinico?.length || 0;
      case "prontuarios":
        return data.prontuarios?.length || 0;
      case "odontogramas":
        return data.odontogramas?.length || 0;
      case "appointments":
        return data.appointments?.length || 0;
      case "financeiro":
        return (
          (data.financeiro?.contasReceber?.length || 0) +
          (data.financeiro?.contasPagar?.length || 0)
        );
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Selecione os dados que deseja restaurar:
      </p>

      <div className="grid grid-cols-1 gap-3">
        {ITEMS_CONFIG.map(({ key, label, icon: Icon }) => {
          const count = getItemCount(key);
          if (count === 0) return null;

          return (
            <Card key={key} className="p-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={selectedItems[key]}
                  onCheckedChange={() => onToggleItem(key)}
                />
                <div className="flex-1 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={key} className="flex-1 cursor-pointer">
                    {label}
                  </Label>
                  <Badge variant="secondary">{count} itens</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
