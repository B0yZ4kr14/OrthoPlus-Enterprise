import { CheckCircle2, XCircle } from "lucide-react";

interface StatsBarProps {
  active: number;
  total: number;
  inactive: number;
}

export function StatsBar({ active, total, inactive }: StatsBarProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-muted-foreground">
          {active} de {total} módulos ativos
        </p>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span>{active} Ativos</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-destructive" />
          <span>{inactive} Inativos</span>
        </div>
      </div>
    </div>
  );
}
