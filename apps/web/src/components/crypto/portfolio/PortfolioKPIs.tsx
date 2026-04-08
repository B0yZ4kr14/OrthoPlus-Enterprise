import { Card, CardContent } from "@orthoplus/core-ui/card";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { formatBRL } from "./types";

interface PortfolioKPIsProps {
  totalBRL: number;
  gains: number;
  losses: number;
}

export function PortfolioKPIs({ totalBRL, gains, losses }: PortfolioKPIsProps) {
  const netResult = gains - losses;
  const isProfit = netResult >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card depth="normal" className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
              <p className="text-2xl font-bold">{formatBRL(totalBRL)}</p>
            </div>
            <Wallet className="h-8 w-8 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card depth="normal" className="border-l-4 border-success">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Ganhos Realizados
              </p>
              <p className="text-2xl font-bold text-success">
                +{formatBRL(gains)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card depth="normal" className="border-l-4 border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Perdas Realizadas
              </p>
              <p className="text-2xl font-bold text-destructive">
                -{formatBRL(losses)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card
        depth="normal"
        className={`border-l-4 ${isProfit ? "border-success" : "border-destructive"}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Resultado Líquido
              </p>
              <p
                className={`text-2xl font-bold ${isProfit ? "text-success" : "text-destructive"}`}
              >
                {isProfit ? "+" : ""}
                {formatBRL(netResult)}
              </p>
            </div>
            <DollarSign
              className={`h-8 w-8 opacity-20 ${isProfit ? "text-success" : "text-destructive"}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
