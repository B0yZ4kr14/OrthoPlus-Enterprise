import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { apiClient } from "@/lib/api/apiClient";
import {
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingState } from "@/components/shared/LoadingState";
import { MovimentoCaixa } from "../../types/financeiro-completo.types";
import { useCallback } from "react";

export default function RelatorioCaixa() {
  const { clinicId } = useAuth();
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"hoje" | "semana" | "mes">("hoje");

  const loadMovimentos = useCallback(async () => {
    if (!clinicId) return;

    setLoading(true);
    try {
      const dataInicio = new Date();

      if (filtro === "hoje") {
        dataInicio.setHours(0, 0, 0, 0);
      } else if (filtro === "semana") {
        dataInicio.setDate(dataInicio.getDate() - 7);
      } else {
        dataInicio.setDate(dataInicio.getDate() - 30);
      }

      const params: Record<string, string> = {
        status: "FECHADO",
        start_date: dataInicio.toISOString(),
      };

      const data = await apiClient.get<MovimentoCaixa[]>(
        "/financeiro/movimentos",
        {
          params,
        },
      );
      setMovimentos(data || []);
    } catch (error) {
      console.error("Error loading movimentos:", error);
    } finally {
      setLoading(false);
    }
  }, [clinicId, filtro]);

  useEffect(() => {
    loadMovimentos();
  }, [loadMovimentos]);

  const stats = useMemo(() => {
    const totalSobras = movimentos
      .filter((m) => (m.diferenca || 0) > 0)
      .reduce((sum, m) => sum + (m.diferenca || 0), 0);

    const totalFaltas = movimentos
      .filter((m) => (m.diferenca || 0) < 0)
      .reduce((sum, m) => sum + Math.abs(m.diferenca || 0), 0);

    const totalMovimentado = movimentos.reduce(
      (sum, m) => sum + ((m.valor_esperado || 0) - (m.valor_inicial || 0)),
      0,
    );

    return { totalSobras, totalFaltas, totalMovimentado };
  }, [movimentos]);

  const { totalSobras, totalFaltas, totalMovimentado } = stats;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          title="Relatório de Caixa"
          description="Histórico de movimentações e fechamentos"
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <PageHeader
          icon={FileText}
          title="Relatório de Caixa"
          description="Histórico de movimentações e fechamentos"
        />

        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
          <Button
            variant={filtro === "hoje" ? "default" : "ghost"}
            onClick={() => setFiltro("hoje")}
            size="sm"
            className="h-8 px-4"
          >
            Hoje
          </Button>
          <Button
            variant={filtro === "semana" ? "default" : "ghost"}
            onClick={() => setFiltro("semana")}
            size="sm"
            className="h-8 px-4"
          >
            7 dias
          </Button>
          <Button
            variant={filtro === "mes" ? "default" : "ghost"}
            onClick={() => setFiltro("mes")}
            size="sm"
            className="h-8 px-4"
          >
            30 dias
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="metric" depth="subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Movimentado
                </p>
                <p className="text-2xl font-black text-primary">
                  R${" "}
                  {totalMovimentado.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="metric" depth="subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sobras
                </p>
                <p className="text-2xl font-black text-success">
                  +R${" "}
                  {totalSobras.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="metric" depth="subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Faltas
                </p>
                <p className="text-2xl font-black text-destructive">
                  -R${" "}
                  {totalFaltas.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Movimentos */}
      <Card depth="normal">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Histórico de Fechamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {movimentos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">
                Nenhum fechamento de caixa encontrado
              </p>
              <p className="text-sm">Tente alterar o período selecionado</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {[...movimentos].reverse().map((mov) => {
                const diferenca = mov.diferenca || 0;
                const hasDiferenca = Math.abs(diferenca) > 0.01;

                return (
                  <div
                    key={mov.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-muted/30 transition-all group"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="px-3 py-1 bg-accent/30 rounded-full text-sm font-bold flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {mov.fechado_em
                            ? format(
                                new Date(mov.fechado_em),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )
                            : "--/--/----"}
                        </div>
                        <Badge
                          variant="secondary"
                          className="px-2 font-mono text-[10px]"
                        >
                          OPERADOR:{" "}
                          {mov.user?.full_name?.toUpperCase() || "SISTEMA"}
                        </Badge>
                      </div>

                      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Valor Inicial
                          </dt>
                          <dd className="font-mono text-base font-semibold">
                            R${" "}
                            {(mov.valor_inicial || 0).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </dd>
                        </div>
                        <div className="space-y-1">
                          <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Valor Esperado
                          </dt>
                          <dd className="font-mono text-base font-semibold text-primary">
                            R${" "}
                            {(mov.valor_esperado || 0).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </dd>
                        </div>
                        <div className="space-y-1">
                          <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Valor Contado
                          </dt>
                          <dd className="font-mono text-base font-semibold italic">
                            R${" "}
                            {(mov.valor_final || 0).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </dd>
                        </div>
                      </dl>

                      {mov.observacoes && (
                        <div className="p-3 bg-muted/20 border-l-2 border-primary/30 rounded-r-lg">
                          <p className="text-xs text-muted-foreground italic">
                            &ldquo;{mov.observacoes}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-6 md:mt-0">
                      {hasDiferenca ? (
                        <div
                          className={`px-4 py-2 rounded-xl border flex flex-col items-end ${
                            diferenca > 0
                              ? "bg-success/5 border-success/20 text-success"
                              : "bg-destructive/5 border-destructive/20 text-destructive"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            {diferenca > 0
                              ? "Sobra de Caixa"
                              : "Falta de Caixa"}
                          </span>
                          <span className="text-lg font-black font-mono">
                            {diferenca > 0 ? "+" : "-"}R${" "}
                            {Math.abs(diferenca).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-xl bg-success/10 text-success border border-success/20 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase">
                            Conferido
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
