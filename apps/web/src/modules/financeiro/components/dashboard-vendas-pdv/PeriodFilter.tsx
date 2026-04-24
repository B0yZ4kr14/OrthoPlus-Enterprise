// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import type { Periodo } from "./types";

interface PeriodFilterProps {
  periodo: Periodo;
  onChange: (periodo: Periodo) => void;
}

const PERIODS: { value: Periodo; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
];

export function PeriodFilter({ periodo, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <Badge
          key={p.value}
          variant={periodo === p.value ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </Badge>
      ))}
    </div>
  );
}
