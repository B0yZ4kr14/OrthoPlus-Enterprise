import { Award } from "lucide-react";
import { Badge } from "@orthoplus/core-ui/badge";
import type { ExchangeRateRowProps } from "../types";
import { RateValue } from "./RateValue";

export function ExchangeRateRow({
  rate,
  index,
  amountNum,
  isBest,
  savings,
}: ExchangeRateRowProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isBest
          ? "border-success bg-success/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isBest && <Award className="h-5 w-5 text-success" />}
          <div>
            <h4 className="font-semibold">{rate.exchange}</h4>
            <p className="text-xs text-muted-foreground">
              Taxa: {rate.fee}%
            </p>
          </div>
        </div>
        <Badge variant={isBest ? "success" : "outline"}>
          #{index + 1}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <RateValue label="Cotação" value={rate.rate} />
        <RateValue
          label="Valor Bruto"
          value={rate.rate * amountNum}
        />
        <RateValue
          label="Valor Líquido"
          value={rate.netAmount}
          highlight={isBest}
        />
      </div>

      {isBest && savings && savings > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-success">
            💰 Economia de R${" "}
            {savings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            {" "}comparado à pior taxa
          </p>
        </div>
      )}
    </div>
  );
}
