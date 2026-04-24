// cspell:disable
import { ShoppingCart, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { Card } from "@orthoplus/core-ui/card";
import type { Stats } from "./types";

interface KPICardsProps {
  stats: Stats;
}

export function KPICards({ stats }: KPICardsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Vendas</p>
            <p className="text-2xl font-bold">{stats.totalVendas}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10">
            <DollarSign className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10">
            <TrendingUp className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.ticketMedio)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-info/10">
            <BarChart3 className="h-6 w-6 text-info" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Itens Vendidos</p>
            <p className="text-2xl font-bold">{stats.itensVendidos}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
