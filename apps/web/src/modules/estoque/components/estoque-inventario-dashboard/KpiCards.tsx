// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { KpiData } from "./types";

interface KpiCardsProps {
  kpis: KpiData;
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6" depth="normal">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Inventários Realizados
            </p>
            <p className="text-3xl font-bold mt-2">{kpis.totalInventarios}</p>
          </div>
          <Package className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="p-6" depth="normal">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Acuracidade Média
            </p>
            <p className="text-3xl font-bold mt-2">
              {kpis.acuracidadeMedia.toFixed(1)}%
            </p>
            {kpis.acuracidadeMedia >= 95 ? (
              <Badge variant="success" className="mt-2">
                Excelente
              </Badge>
            ) : kpis.acuracidadeMedia >= 90 ? (
              <Badge variant="default" className="mt-2">
                Bom
              </Badge>
            ) : (
              <Badge variant="destructive" className="mt-2">
                Precisa Melhorar
              </Badge>
            )}
          </div>
          <TrendingUp className="h-8 w-8 text-success" />
        </div>
      </Card>

      <Card className="p-6" depth="normal">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Valor Total de Perdas
            </p>
            <p className="text-3xl font-bold mt-2">
              R$ {kpis.totalPerdas.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {kpis.variacaoPerdas > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    +{kpis.variacaoPerdas.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">
                    {kpis.variacaoPerdas.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">
                vs período anterior
              </span>
            </div>
          </div>
          <AlertTriangle className="h-8 w-8 text-warning" />
        </div>
      </Card>

      <Card className="p-6" depth="normal">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total de Divergências
            </p>
            <p className="text-3xl font-bold mt-2">{kpis.totalDivergencias}</p>
            <p className="text-xs text-muted-foreground mt-2">
              de {kpis.totalItensAnalisados} itens analisados
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
      </Card>
    </div>
  );
}
