import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";
import type { PriceTooltipProps } from "../types";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
}

export function PriceTooltip({ active, payload }: PriceTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const price = payload[0]?.value as number;
  const upperBand = payload[1]?.value as number;
  const lowerBand = payload[3]?.value as number;

  return (
    <div className="bg-card border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-2">
        {format(new Date(data.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
      </p>
      <p className="text-sm font-semibold">Preço: R$ {formatCurrency(price)}</p>
      {upperBand && (
        <p className="text-xs text-muted-foreground">
          Banda Superior: R$ {formatCurrency(upperBand)}
        </p>
      )}
      {lowerBand && (
        <p className="text-xs text-muted-foreground">
          Banda Inferior: R$ {formatCurrency(lowerBand)}
        </p>
      )}
    </div>
  );
}
