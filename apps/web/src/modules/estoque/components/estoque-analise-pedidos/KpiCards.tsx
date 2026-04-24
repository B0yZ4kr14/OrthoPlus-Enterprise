// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/validation.utils";
import type { AnaliseStats } from "./types";

interface KpiCardsProps {
  stats: AnaliseStats;
}

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Pedidos</p>
            <p className="text-2xl font-bold">{stats.totalPedidos}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Pedidos Automáticos
            </p>
            <p className="text-2xl font-bold">{stats.pedidosAutomaticos}</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalPedidos > 0
                ? Math.round(
                    (stats.pedidosAutomaticos / stats.totalPedidos) * 100,
                  )
                : 0}
              % do total
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-green-500/10">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.valorTotal)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-500/10">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Tempo Médio Entrega
            </p>
            <p className="text-2xl font-bold">
              {stats.tempoMedioEntrega.toFixed(1)} dias
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/10">
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Economia com Automação
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.economiaAutomacao)}
            </p>
            <p className="text-xs text-muted-foreground">Estimado</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
