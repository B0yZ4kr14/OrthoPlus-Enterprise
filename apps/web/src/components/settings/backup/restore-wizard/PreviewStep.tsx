import { Label } from "@orthoplus/core-ui/label";
import { Database, Clock, CheckCircle } from "lucide-react";
import type { BackupOption } from "./types";

interface PreviewStepProps {
  backup: BackupOption;
}

const PREVIEW_ITEMS = [
  { label: "Pacientes", count: "1.234", icon: Database },
  { label: "Consultas", count: "5.678", icon: Clock },
  { label: "Prontuários", count: "987", icon: CheckCircle },
];

export function PreviewStep({ backup }: PreviewStepProps) {
  return (
    <div className="space-y-4 py-4">
      <Label>Pré-visualização dos Dados</Label>
      <div className="space-y-3">
        {PREVIEW_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-muted-foreground">{item.count} registros</span>
            </div>
          );
        })}
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-1">
        <div className="font-medium">Detalhes do Backup</div>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>Data: {backup.date}</p>
          <p>Tipo: {backup.type}</p>
          <p>Tamanho: {backup.size}</p>
        </div>
      </div>
    </div>
  );
}
