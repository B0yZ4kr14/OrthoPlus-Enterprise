import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Tabs, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatBRL } from "@/lib/format";
import { EmptyChartCard } from "./EmptyChartCard";

interface AppointmentDataPoint {
  name: string;
  agendadas: number;
  realizadas: number;
}

interface RevenueDataPoint {
  name: string;
  receita: number;
  despesas: number;
}

interface DashboardChartsProps {
  appointmentsData: AppointmentDataPoint[];
  revenueData: RevenueDataPoint[];
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  dataKey: string;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card shadow-lg rounded-lg p-3 border border-border min-w-[140px]">
      <p className="text-xs font-medium text-muted-foreground mb-2">{String(label)}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {formatter ? formatter(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const DashboardChartsMemo = memo<DashboardChartsProps>(
  ({ appointmentsData, revenueData }) => {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Gráfico de Consultas */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Consultas da Semana</CardTitle>
                  <CardDescription>Agendadas vs Realizadas</CardDescription>
                </div>
                <Tabs defaultValue="semana" className="w-auto">
                  <TabsList aria-label="Período do gráfico de consultas">
                    <TabsTrigger value="semana" className="min-h-[44px]">Semana</TabsTrigger>
                    <TabsTrigger value="mes" className="min-h-[44px]">Mês</TabsTrigger>
                    <TabsTrigger value="ano" className="min-h-[44px]">Ano</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsData.length === 0 ? (
                <EmptyChartCard
                  title="Sem dados de consultas"
                  description="Não há dados de consultas para o período selecionado."
                />
              ) : (
                <div role="img" aria-label="Gráfico de Consultas da Semana: Agendadas vs Realizadas">
                  <span className="sr-only">
                    <table>
                      <caption>Gráfico de Consultas da Semana: Agendadas vs Realizadas</caption>
                      <thead>
                        <tr>
                          <th>Período</th>
                          <th>Agendadas</th>
                          <th>Realizadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsData.map((row, i) => (
                          <tr key={i}>
                            <td>{row.name}</td>
                            <td>{row.agendadas}</td>
                            <td>{row.realizadas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </span>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={appointmentsData}>
                      <defs>
                        <linearGradient
                          id="gradientAgendadas"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradientRealizadas"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#14B8A6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#14B8A6"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        content={(props) => (
                          <ChartTooltip
                            active={props.active}
                            payload={props.payload as TooltipPayloadItem[]}
                            label={props.label}
                          />
                        )}
                      />
                      <Legend />
                      <Bar
                        dataKey="agendadas"
                        fill="url(#gradientAgendadas)"
                        name="Agendadas"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="realizadas"
                        fill="url(#gradientRealizadas)"
                        name="Realizadas"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Receita */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Desempenho Financeiro</CardTitle>
                  <CardDescription>Receitas e Despesas</CardDescription>
                </div>
                <Tabs defaultValue="semana" className="w-auto">
                  <TabsList aria-label="Período do gráfico financeiro">
                    <TabsTrigger value="semana" className="min-h-[44px]">Semana</TabsTrigger>
                    <TabsTrigger value="mes" className="min-h-[44px]">Mês</TabsTrigger>
                    <TabsTrigger value="ano" className="min-h-[44px]">Ano</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {revenueData.length === 0 ? (
                <EmptyChartCard
                  title="Sem dados financeiros"
                  description="Não há dados financeiros para o período selecionado."
                />
              ) : (
                <div role="img" aria-label="Gráfico de Desempenho Financeiro: Receitas e Despesas">
                  <span className="sr-only">
                    <table>
                      <caption>Gráfico de Desempenho Financeiro: Receitas e Despesas</caption>
                      <thead>
                        <tr>
                          <th>Período</th>
                          <th>Receita</th>
                          <th>Despesas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.map((row, i) => (
                          <tr key={i}>
                            <td>{row.name}</td>
                            <td>{row.receita}</td>
                            <td>{row.despesas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </span>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient
                          id="gradientReceita"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradientDespesas"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#EF4444"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#EF4444"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        content={(props) => (
                          <ChartTooltip
                            active={props.active}
                            payload={props.payload as TooltipPayloadItem[]}
                            label={props.label}
                            formatter={formatBRL}
                          />
                        )}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="receita"
                        stroke="#10B981"
                        fill="url(#gradientReceita)"
                        fillOpacity={0.15}
                        name="Receita"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#10B981" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="despesas"
                        stroke="#EF4444"
                        fill="url(#gradientDespesas)"
                        fillOpacity={0.15}
                        name="Despesas"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#EF4444" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.appointmentsData) ===
        JSON.stringify(nextProps.appointmentsData) &&
      JSON.stringify(prevProps.revenueData) ===
        JSON.stringify(nextProps.revenueData)
    );
  },
);

DashboardChartsMemo.displayName = "DashboardChartsMemo";
