import { useMemo } from "react";
import { Card } from "@orthoplus/core-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AnaliseComplete } from "../types/radiografia.types";
import { tipoRadiografiaLabels } from "../types/radiografia.types";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Activity,
} from "lucide-react";

interface AnaliseChartsProps {
  analises: AnaliseComplete[];
}

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
};

const STATUS_COLORS = {
  PENDENTE: CHART_COLORS.muted,
  PROCESSANDO: CHART_COLORS.warning,
  CONCLUIDA: CHART_COLORS.success,
  ERRO: CHART_COLORS.destructive,
};

export function AnaliseCharts({ analises }: AnaliseChartsProps) {
  // Análises por mês
  const analisesPorMes = useMemo(() => {
    const meses = new Map<
      string,
      { mes: string; total: number; concluidas: number; problemas: number }
    >();

    analises.forEach((analise) => {
      const data = new Date(analise.created_at);
      const mesAno = `${data.toLocaleDateString("pt-BR", { month: "short" })}/${data.getFullYear().toString().slice(-2)}`;

      if (!meses.has(mesAno)) {
        meses.set(mesAno, {
          mes: mesAno,
          total: 0,
          concluidas: 0,
          problemas: 0,
        });
      }

      const entry = meses.get(mesAno)!;
      entry.total++;
      if (analise.status_analise === "CONCLUIDA") {
        entry.concluidas++;
      }
      entry.problemas += analise.problemas_detectados || 0;
    });

    return Array.from(meses.values()).slice(-6); // últimos 6 meses
  }, [analises]);

  // Análises por tipo
  const analisesPorTipo = useMemo(() => {
    const tipos = new Map<string, number>();

    analises.forEach((analise) => {
      const tipo =
        tipoRadiografiaLabels[
          analise.tipo_radiografia as keyof typeof tipoRadiografiaLabels
        ] || analise.tipo_radiografia;
      tipos.set(tipo, (tipos.get(tipo) || 0) + 1);
    });

    return Array.from(tipos.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [analises]);

  // Análises por status
  const analisesPorStatus = useMemo(() => {
    const status = new Map<string, number>();

    analises.forEach((analise) => {
      status.set(
        analise.status_analise,
        (status.get(analise.status_analise) || 0) + 1,
      );
    });

    return Array.from(status.entries()).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
      color:
        STATUS_COLORS[name as keyof typeof STATUS_COLORS] || CHART_COLORS.muted,
    }));
  }, [analises]);

  // Taxa de precisão ao longo do tempo
  const precisaoAoLongoTempo = useMemo(() => {
    const meses = new Map<
      string,
      { mes: string; precisao: number; count: number }
    >();

    analises.forEach((analise) => {
      if (analise.confidence_score && analise.confidence_score > 0) {
        const data = new Date(analise.created_at);
        const mesAno = `${data.toLocaleDateString("pt-BR", { month: "short" })}/${data.getFullYear().toString().slice(-2)}`;

        if (!meses.has(mesAno)) {
          meses.set(mesAno, { mes: mesAno, precisao: 0, count: 0 });
        }

        const entry = meses.get(mesAno)!;
        entry.precisao += analise.confidence_score;
        entry.count++;
      }
    });

    return Array.from(meses.values())
      .map(({ mes, precisao, count }) => ({
        mes,
        precisao: Math.round(precisao / count),
      }))
      .slice(-6);
  }, [analises]);

  return (
    <Card className="p-6" depth="intense">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Estatísticas e Análises</h2>
      </div>

      <Tabs defaultValue="temporal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="temporal" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Temporal
          </TabsTrigger>
          <TabsTrigger value="tipos" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Por Tipo
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <BarChartIcon className="h-4 w-4" />
            Por Status
          </TabsTrigger>
          <TabsTrigger value="precisao" className="gap-2">
            <Activity className="h-4 w-4" />
            Precisão IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temporal" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              Análises e Problemas Detectados (Últimos 6 Meses)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analisesPorMes}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="mes" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="total"
                  name="Total de Análises"
                  fill={CHART_COLORS.primary}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="concluidas"
                  name="Concluídas"
                  fill={CHART_COLORS.success}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="problemas"
                  name="Problemas Detectados"
                  fill={CHART_COLORS.warning}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="tipos" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              Distribuição por Tipo de Radiografia
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analisesPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill={CHART_COLORS.primary}
                  dataKey="value"
                >
                  {analisesPorTipo.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        Object.values(CHART_COLORS)[
                          index % Object.values(CHART_COLORS).length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analisesPorStatus} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis type="number" stroke="hsl(var(--foreground))" />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" name="Quantidade" radius={[0, 8, 8, 0]}>
                  {analisesPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="precisao" className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              Evolução da Precisão da IA (Últimos 6 Meses)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={precisaoAoLongoTempo}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="mes" stroke="hsl(var(--foreground))" />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  domain={[0, 100]}
                  label={{
                    value: "Precisão (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Precisão"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="precisao"
                  name="Precisão Média (%)"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.primary, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
