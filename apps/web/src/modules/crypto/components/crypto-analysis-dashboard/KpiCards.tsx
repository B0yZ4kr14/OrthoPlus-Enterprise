// cspell:disable
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import type { AnalysisStats } from "./types";

interface KpiCardsProps {
  stats: AnalysisStats;
}

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card depth="normal">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Economia Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            R${" "}
            {stats.savings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.savingsPercent}% menos que métodos tradicionais
          </p>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa Atual BTC
          </CardTitle>
          {stats.rateChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R${" "}
            {stats.currentRate.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p
            className={`text-xs mt-1 ${stats.rateChange >= 0 ? "text-success" : "text-destructive"}`}
          >
            {stats.rateChange >= 0 ? "+" : ""}
            {stats.rateChange.toFixed(2)}% (7 dias)
          </p>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R${" "}
            {stats.totalVolumeBRL.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalTransactions} transações confirmadas
          </p>
        </CardContent>
      </Card>

      <Card depth="normal">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Status Conversão
          </CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          {stats.currentRate <= stats.optimalConversionRate ? (
            <>
              <Badge variant="success" className="mb-2">
                Momento Ideal
              </Badge>
              <p className="text-xs text-muted-foreground">
                Taxa favorável para converter
              </p>
            </>
          ) : (
            <>
              <Badge variant="warning" className="mb-2">
                Aguardar
              </Badge>
              <p className="text-xs text-muted-foreground">
                Melhor aguardar queda na taxa
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
