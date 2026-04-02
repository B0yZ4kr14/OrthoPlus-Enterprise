import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatting.utils";
import type { FluxoCaixaData } from "@/application/use-cases/financeiro";

interface FluxoCaixaDashboardProps {
  data: FluxoCaixaData | null;
  loading: boolean;
}

export function FluxoCaixaDashboard({
  data,
  loading,
}: FluxoCaixaDashboardProps) {
  if (loading) {
    return <div className="text-center py-8">Carregando dashboard...</div>;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum dado disponível
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total a Receber
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(data.totalReceber)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.contasReceberVencidas > 0 && (
                <span className="text-destructive">
                  {data.contasReceberVencidas} contas vencidas
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(data.totalPagar)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.contasPagarVencidas > 0 && (
                <span className="text-destructive">
                  {data.contasPagarVencidas} contas vencidas
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo do Período
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalRecebido - data.totalPago)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total Recebido
              </span>
              <span className="font-medium text-success">
                {formatCurrency(data.totalRecebido)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Saldo a Receber
              </span>
              <span className="font-medium">
                {formatCurrency(data.saldoReceber)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Pago</span>
              <span className="font-medium text-destructive">
                {formatCurrency(data.totalPago)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Saldo a Pagar
              </span>
              <span className="font-medium">
                {formatCurrency(data.saldoPagar)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.caixaAtual.isAberto && (
        <Card>
          <CardHeader>
            <CardTitle>Caixa Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-medium text-success">Aberto</span>
            </div>
            {data.caixaAtual.valorInicial !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Valor Inicial
                </span>
                <span className="font-medium">
                  {formatCurrency(data.caixaAtual.valorInicial)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
