import { Badge } from "@orthoplus/core-ui/badge";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import type { RSITooltipProps } from "../types";

export function RSITooltip({ active, payload }: RSITooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const rsiValue = payload[0].value;
  const data = payload[0].payload;

  const getVariant = () => {
    if (rsiValue > 70) return "destructive";
    if (rsiValue < 30) return "success";
    return "secondary";
  };

  const getLabel = () => {
    if (rsiValue > 70) return "Sobrecompra";
    if (rsiValue < 30) return "Sobrevenda";
    return "Neutro";
  };

  return (
    <div className="bg-card border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-2">
        {format(new Date(data.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
      </p>
      <p className="text-sm font-semibold">RSI: {rsiValue.toFixed(2)}</p>
      <Badge variant={getVariant()} className="mt-1">
        {getLabel()}
      </Badge>
    </div>
  );
}
